import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import EmbeddedPostgres from 'embedded-postgres';
import request from 'supertest';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSchemaPath } from '../src/db/schema-path';
import type { jwtService as JwtService } from '../src/services/jwt.service';
import type { cutoffJobService as CutoffJobService } from '../src/services/cutoffJob.service';

const testPort = 30000 + (process.pid % 10000) + 1;
const databaseUrl = `postgres://postgres:password@127.0.0.1:${testPort}/postgres`;
const databaseDir = `./.tmp/embedded-postgres-week4-${process.pid}-${Date.now()}`;
const webhookSecret = 'unit_webhook_secret';

let embeddedPostgres: EmbeddedPostgres;
let app: Express;
let pool: Pool;
let jwtService: typeof JwtService;
let cutoffJobService: typeof CutoffJobService;
let phoneCounter = 0;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough';
  process.env.APP_TIME_ZONE = 'Asia/Kolkata';
  process.env.RAZORPAY_KEY_ID = 'rzp_test_unit_key';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_unit_secret';
  process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;

  embeddedPostgres = new EmbeddedPostgres({
    databaseDir,
    user: 'postgres',
    password: 'password',
    port: testPort,
    persistent: true,
    onLog: () => undefined,
    onError: () => undefined
  });

  await embeddedPostgres.initialise();
  await embeddedPostgres.start();

  const appModule = await import('../src/app');
  const poolModule = await import('../src/db/pool');
  const jwtModule = await import('../src/services/jwt.service');
  const cutoffJobModule = await import('../src/services/cutoffJob.service');

  app = appModule.createApp();
  pool = poolModule.pool;
  jwtService = jwtModule.jwtService;
  cutoffJobService = cutoffJobModule.cutoffJobService;
}, 90000);

async function resetDatabase() {
  const schemaSql = await readFile(getSchemaPath(), 'utf8');
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
  await pool.query('CREATE SCHEMA public');
  await pool.query(schemaSql);
}

async function createUser(
  role: 'student' | 'admin' | 'ops' | 'delivery_agent',
  data: { campus_id?: string | null } = {}
) {
  phoneCounter += 1;
  const phone = `8${String(phoneCounter).padStart(9, '0')}`;
  const result = await pool.query(
    'INSERT INTO app_user (phone, name, role, campus_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [phone, `${role} user`, role, data.campus_id ?? null]
  );
  return result.rows[0];
}

async function createCampus(
  data: {
    name?: string;
    city?: string;
    cutoff_time?: string;
    delivery_time?: string;
    is_active?: boolean;
  } = {}
) {
  const result = await pool.query(
    `INSERT INTO campus (name, city, cutoff_time, delivery_time, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.name ?? 'Poornima University',
      data.city ?? 'Jaipur',
      data.cutoff_time ?? '23:59:59',
      data.delivery_time ?? '19:00',
      data.is_active ?? true
    ]
  );
  return result.rows[0];
}

async function createRestaurant(campusId: string, data: { name?: string } = {}) {
  const result = await pool.query(
    `INSERT INTO restaurant (campus_id, name)
     VALUES ($1, $2)
     RETURNING *`,
    [campusId, data.name ?? 'Burger Farm']
  );
  return result.rows[0];
}

async function createMenuItem(restaurantId: string, data: { name?: string; price?: string } = {}) {
  const result = await pool.query(
    `INSERT INTO menu_item (restaurant_id, name, price)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [restaurantId, data.name ?? 'Classic Burger', data.price ?? '149.00']
  );
  return result.rows[0];
}

function tokenFor(user: { id: string; role: 'student' | 'admin' | 'ops' | 'delivery_agent'; campus_id: string | null }) {
  return jwtService.sign({
    id: user.id,
    role: user.role,
    campus_id: user.campus_id
  });
}

async function placeTestOrder(token: string, restaurantId: string, itemId: string, quantity = 1, dropPoint = 'Gate 1') {
  await request(app)
    .post('/api/v1/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      restaurant_id: restaurantId,
      items: [{ menu_item_id: itemId, quantity }]
    })
    .expect(201);

  const res = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ drop_point: dropPoint })
    .expect(201);

  return res.body.data.order_id as string;
}

function signRawWebhook(raw: string) {
  return crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');
}

function capturedWebhook(
  gatewayOrderId: string,
  gatewayTxnId: string,
  data: { createdAt?: number; amount?: number; currency?: string; status?: string; captured?: boolean } = {}
) {
  return {
    event: 'payment.captured',
    created_at: data.createdAt ?? Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: gatewayTxnId,
          order_id: gatewayOrderId,
          amount: data.amount ?? 14900,
          currency: data.currency ?? 'INR',
          status: data.status ?? 'captured',
          captured: data.captured ?? true
        }
      }
    }
  };
}

function refundWebhook(
  gatewayRefundId: string,
  gatewayTxnId: string,
  gatewayOrderId: string,
  status: 'processed' | 'failed'
) {
  return {
    event: status === 'processed' ? 'refund.processed' : 'refund.failed',
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      refund: {
        entity: {
          id: gatewayRefundId,
          order_id: gatewayOrderId,
          payment_id: gatewayTxnId,
          amount: 14900,
          status
        }
      }
    }
  };
}

function mockRazorpayOrder(gatewayOrderId: string) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const target = typeof url === 'string' ? url : url.toString();
    if (target.endsWith('/orders') && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          id: gatewayOrderId,
          amount: 14900,
          currency: 'INR',
          receipt: 'receipt_test',
          status: 'created'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (target.includes('/refund') && init?.method === 'POST') {
      return new Response(
        JSON.stringify({
          id: 'rfnd_test_123',
          amount: 14900,
          currency: 'INR',
          payment_id: 'pay_test_123',
          status: 'processed'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    throw new Error(`Unexpected fetch to ${target}`);
  });
}

beforeEach(async () => {
  await resetDatabase();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await pool.end();
  await embeddedPostgres.stop();
});

describe('Week 4 Ops, Refunds, and Delivery Workflow', () => {
  it('enforces role isolation across ops and delivery routes', async () => {
    const campus = await createCampus();
    const student = await createUser('student', { campus_id: campus.id });
    const agent = await createUser('delivery_agent', { campus_id: campus.id });
    const ops = await createUser('ops', { campus_id: campus.id });

    // Student receives 403 on ops and delivery routes
    await request(app)
      .get('/api/v1/ops/refunds')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(403);

    await request(app)
      .get('/api/v1/delivery/my-batches')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(403);

    // Delivery agent receives 403 on ops and admin routes
    await request(app)
      .get('/api/v1/ops/refunds')
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(403);

    await request(app)
      .post('/api/v1/admin/campuses')
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .send({ name: 'New Campus', city: 'City', cutoff_time: '12:00', delivery_time: '13:00' })
      .expect(403);

    // Ops can access ops routes
    await request(app)
      .get('/api/v1/ops/refunds')
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);
  });

  it('handles ops batch grouping, procurement update, item confirmation, and item unavailability with refund audit', async () => {
    const campus = await createCampus({ cutoff_time: '23:59:59' });
    const restaurant = await createRestaurant(campus.id);
    const item = await createMenuItem(restaurant.id, { price: '100.00' });
    const student = await createUser('student', { campus_id: campus.id });
    const ops = await createUser('ops', { campus_id: campus.id });

    mockRazorpayOrder('order_rzp_ops_test');

    // Place order and pay before cutoff
    const orderId = await placeTestOrder(tokenFor(student), restaurant.id, item.id, 2, 'Gate 1');
    await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200);

    const rawWebhook = JSON.stringify(capturedWebhook('order_rzp_ops_test', 'pay_ops_test', { amount: 20000 }));
    await request(app)
      .post('/api/v1/webhooks/payment')
      .set('X-Razorpay-Signature', signRawWebhook(rawWebhook))
      .set('Content-Type', 'application/json')
      .send(rawWebhook)
      .expect(200);

    // Update campus cutoff time to the past so cutoff job triggers
    await pool.query("UPDATE campus SET cutoff_time = '00:01:00' WHERE id = $1", [campus.id]);
    const runRes = await cutoffJobService.runForCampus(campus.id);
    expect(runRes.results.length).toBe(1);

    const batchId = runRes.results[0].batch_id;

    // Get batch detail as ops
    const batchRes = await request(app)
      .get(`/api/v1/ops/batches/${batchId}`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);

    expect(batchRes.body.data.total_orders).toBe(1);
    expect(batchRes.body.data.restaurants[0].restaurant_id).toBe(restaurant.id);

    const procTaskId = (await pool.query('SELECT id FROM procurement_task WHERE batch_id = $1', [batchId])).rows[0].id;

    // Update procurement task
    const updateTaskRes = await request(app)
      .post(`/api/v1/ops/procurement-tasks/${procTaskId}`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({
        status: 'placed',
        platform: 'zomato',
        actual_cost: '180.00',
        external_order_ref: 'ZOM-999'
      })
      .expect(200);

    expect(updateTaskRes.body.data.status).toBe('placed');
    expect(updateTaskRes.body.data.platform).toBe('zomato');

    // Get order item id
    const orderItemRow = await pool.query('SELECT id FROM order_item WHERE order_id = $1', [orderId]);
    const orderItemId = orderItemRow.rows[0].id;

    // Mark order item confirmed
    await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-confirmed`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);

    // Idempotent confirmation no-op
    await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-confirmed`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);

    // Mark order item unavailable
    const unavRes = await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-unavailable`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({ reason: 'Item spilled' })
      .expect(200);

    expect(unavRes.body.data.item.item_status).toBe('unavailable');
    expect(Number(unavRes.body.data.item.refund_amount)).toBe(200.00);
    expect(unavRes.body.data.refund.status).toBe('pending');
    expect(Number(unavRes.body.data.refund.amount)).toBe(200.00);

    // Confirm that exceeding price_snapshot * quantity violates chk_refund_amount_max in Postgres
    await expect(pool.query('UPDATE order_item SET refund_amount = $1 WHERE id = $2', [300.00, orderItemId])).rejects.toThrow(/chk_refund_amount_max/);

    // Idempotent unavailable check (guarded write)
    await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-unavailable`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({ reason: 'Item spilled again' })
      .expect(200);

    // Check audit logs
    const auditRows = await pool.query('SELECT action FROM audit_log WHERE order_id = $1', [orderId]);
    const actions = auditRows.rows.map((r) => r.action);
    expect(actions).toContain('order_item.confirmed');
    expect(actions).toContain('order_item.unavailable');
    expect(actions).toContain('refund.created');
  });

  it('covers delivery agent assigned-batch visibility, delivery start, OTP verification, rejection of invalid OTP, and not-delivered recording', async () => {
    const campus = await createCampus({ cutoff_time: '23:59:59' });
    const restaurant = await createRestaurant(campus.id);
    const item = await createMenuItem(restaurant.id);
    const student1 = await createUser('student', { campus_id: campus.id });
    const student2 = await createUser('student', { campus_id: campus.id });
    const agent = await createUser('delivery_agent', { campus_id: campus.id });

    mockRazorpayOrder('order_rzp_del_1');

    // Place and pay order 1 before cutoff
    const orderId1 = await placeTestOrder(tokenFor(student1), restaurant.id, item.id, 1, 'Hostel A');
    await request(app).post(`/api/v1/orders/${orderId1}/pay`).set('Authorization', `Bearer ${tokenFor(student1)}`).expect(200);
    const rawWh1 = JSON.stringify(capturedWebhook('order_rzp_del_1', 'pay_del_1'));
    await request(app).post('/api/v1/webhooks/payment').set('X-Razorpay-Signature', signRawWebhook(rawWh1)).set('Content-Type', 'application/json').send(rawWh1).expect(200);

    mockRazorpayOrder('order_rzp_del_2');

    // Place and pay order 2 before cutoff
    const orderId2 = await placeTestOrder(tokenFor(student2), restaurant.id, item.id, 1, 'Hostel B');
    await request(app).post(`/api/v1/orders/${orderId2}/pay`).set('Authorization', `Bearer ${tokenFor(student2)}`).expect(200);
    const rawWh2 = JSON.stringify(capturedWebhook('order_rzp_del_2', 'pay_del_2'));
    await request(app).post('/api/v1/webhooks/payment').set('X-Razorpay-Signature', signRawWebhook(rawWh2)).set('Content-Type', 'application/json').send(rawWh2).expect(200);

    // Update campus cutoff time to the past and run cutoff job
    await pool.query("UPDATE campus SET cutoff_time = '00:01:00' WHERE id = $1", [campus.id]);
    const runRes = await cutoffJobService.runForCampus(campus.id);
    const batchId = runRes.results[0].batch_id;

    // Delivery agent checks my-batches
    const myBatchesRes = await request(app)
      .get('/api/v1/delivery/my-batches')
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(200);
    expect(myBatchesRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(myBatchesRes.body.data[0].batch_id).toBe(batchId);

    // Delivery agent gets batch detail
    const batchDetailRes = await request(app)
      .get(`/api/v1/delivery/batches/${batchId}`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(200);
    expect(batchDetailRes.body.data.orders.length).toBe(2);
    expect(batchDetailRes.body.data.orders[0].phone).toContain('*'); // verify masking

    // Start batch
    const startRes = await request(app)
      .post(`/api/v1/delivery/batches/${batchId}/start`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(200);
    expect(startRes.body.data.batch_status).toBe('out_for_delivery');

    // Verify orders are out_for_delivery
    const order1Row = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId1]);
    expect(order1Row.rows[0].order_status).toBe('out_for_delivery');

    // Attempt delivery of order 1 with invalid OTP -> should be rejected and order status unchanged
    await request(app)
      .post(`/api/v1/delivery/orders/${orderId1}/deliver`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .send({ proof_type: 'otp', proof_value: '000000' })
      .expect(400);

    const checkOrder1 = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId1]);
    expect(checkOrder1.rows[0].order_status).toBe('out_for_delivery');
    const checkAttempt = await pool.query('SELECT * FROM delivery_attempt WHERE order_id = $1', [orderId1]);
    expect(checkAttempt.rows.length).toBe(0);

    // Deliver order 1 with valid OTP (last 4 digits of phone or '1234')
    const phoneLast4 = student1.phone.slice(-4);
    const deliverRes = await request(app)
      .post(`/api/v1/delivery/orders/${orderId1}/deliver`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .send({ proof_type: 'otp', proof_value: phoneLast4 })
      .expect(200);
    expect(deliverRes.body.data.order.order_status).toBe('delivered');
    expect(deliverRes.body.data.attempt.result).toBe('delivered');

    // Mark order 2 not-delivered
    const notDelRes = await request(app)
      .post(`/api/v1/delivery/orders/${orderId2}/not-delivered`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .send({ reason: 'Student asleep' })
      .expect(200);
    expect(notDelRes.body.data.attempt.result).toBe('not_delivered');
    // Order status remains in state for ops decision
    const checkOrder2 = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId2]);
    expect(checkOrder2.rows[0].order_status).toBe('out_for_delivery');
  });

  it('tests unified refund queue, Razorpay mock refund initiation, and refund webhook reconciliation with idempotency', async () => {
    const campus = await createCampus();
    const restaurant = await createRestaurant(campus.id);
    const item = await createMenuItem(restaurant.id);
    const student = await createUser('student', { campus_id: campus.id });
    const ops = await createUser('ops', { campus_id: campus.id });

    mockRazorpayOrder('order_rzp_rfnd_queue');

    // Place order and pay
    const orderId = await placeTestOrder(tokenFor(student), restaurant.id, item.id, 1, 'Lib');
    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${tokenFor(student)}`).expect(200);
    const rawWh = JSON.stringify(capturedWebhook('order_rzp_rfnd_queue', 'pay_rfnd_queue'));
    await request(app).post('/api/v1/webhooks/payment').set('X-Razorpay-Signature', signRawWebhook(rawWh)).set('Content-Type', 'application/json').send(rawWh).expect(200);

    const orderItemRow = await pool.query('SELECT id FROM order_item WHERE order_id = $1', [orderId]);
    const orderItemId = orderItemRow.rows[0].id;

    // Create item-unavailable refund
    await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-unavailable`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({ reason: 'Damaged packaging' })
      .expect(200);

    // Verify refund in queue
    const listRes = await request(app)
      .get('/api/v1/ops/refunds?status=pending')
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    const refund = listRes.body.data.find((r: any) => r.order_id === orderId);
    expect(refund).toBeDefined();
    expect(refund.status).toBe('pending');

    // Initiate refund
    const initRes = await request(app)
      .post(`/api/v1/ops/refunds/${refund.id}/initiate`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);
    expect(initRes.body.data.status).toBe('initiated');
    expect(initRes.body.data.gateway_refund_id).toBe('rfnd_test_123');

    // Idempotent initiate call
    await request(app)
      .post(`/api/v1/ops/refunds/${refund.id}/initiate`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);

    // Webhook reconciliation: refund.processed
    const rfndWhRaw = JSON.stringify(refundWebhook('rfnd_test_123', 'pay_rfnd_queue', 'order_rzp_rfnd_queue', 'processed'));
    const whRes = await request(app)
      .post('/api/v1/webhooks/refund')
      .set('X-Razorpay-Signature', signRawWebhook(rfndWhRaw))
      .set('Content-Type', 'application/json')
      .send(rfndWhRaw)
      .expect(200);
    expect(whRes.body.data.handled).toBe(true);
    expect(whRes.body.data.status).toBe('processed');

    // Idempotent duplicate webhook call
    const dupWhRes = await request(app)
      .post('/api/v1/webhooks/refund')
      .set('X-Razorpay-Signature', signRawWebhook(rfndWhRaw))
      .set('Content-Type', 'application/json')
      .send(rfndWhRaw)
      .expect(200);
    expect(dupWhRes.body.data.duplicate).toBe(true);

    // Verify final DB state and audit
    const checkRfnd = await pool.query('SELECT status, processed_at FROM refund WHERE id = $1', [refund.id]);
    expect(checkRfnd.rows[0].status).toBe('processed');
    expect(checkRfnd.rows[0].processed_at).not.toBeNull();

    const auditCheck = await pool.query("SELECT * FROM audit_log WHERE order_id = $1 AND action = 'refund.processed'", [orderId]);
    expect(auditCheck.rows.length).toBe(1);
  });

  it('full order-to-delivery smoke test: place order, pay before cutoff, run cutoff, ops confirms, delivery delivers', async () => {
    const campus = await createCampus({ cutoff_time: '23:59:59' });
    const restaurant = await createRestaurant(campus.id, { name: 'Smoke Test Diner' });
    const item = await createMenuItem(restaurant.id, { name: 'Special Combo', price: '250.00' });
    const student = await createUser('student', { campus_id: campus.id });
    const ops = await createUser('ops', { campus_id: campus.id });
    const agent = await createUser('delivery_agent', { campus_id: campus.id });

    mockRazorpayOrder('order_rzp_smoke');

    // 1. Student places order before cutoff
    const orderId = await placeTestOrder(tokenFor(student), restaurant.id, item.id, 1, 'Main Library');

    // 2. Student pays before cutoff
    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${tokenFor(student)}`).expect(200);
    const rawWh = JSON.stringify(capturedWebhook('order_rzp_smoke', 'pay_smoke_1', { amount: 25000 }));
    await request(app).post('/api/v1/webhooks/payment').set('X-Razorpay-Signature', signRawWebhook(rawWh)).set('Content-Type', 'application/json').send(rawWh).expect(200);

    const checkOrderPaid = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId]);
    expect(checkOrderPaid.rows[0].order_status).toBe('placed');

    // 3. Update campus cutoff time to the past and run cutoff job
    await pool.query("UPDATE campus SET cutoff_time = '00:01:00' WHERE id = $1", [campus.id]);
    const runRes = await cutoffJobService.runForCampus(campus.id);
    expect(runRes.results.length).toBe(1);
    const batchId = runRes.results[0].batch_id;

    const checkOrderLocked = await pool.query('SELECT order_status, batch_id FROM "order" WHERE id = $1', [orderId]);
    expect(checkOrderLocked.rows[0].order_status).toBe('locked');
    expect(checkOrderLocked.rows[0].batch_id).toBe(batchId);

    // 4. Ops reviews batch and updates procurement task & confirms order item
    const batchDetailRes = await request(app)
      .get(`/api/v1/ops/batches/${batchId}`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);
    expect(batchDetailRes.body.data.total_orders).toBe(1);

    const procTaskId = (await pool.query('SELECT id FROM procurement_task WHERE batch_id = $1', [batchId])).rows[0].id;
    await request(app)
      .post(`/api/v1/ops/procurement-tasks/${procTaskId}`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .send({ status: 'confirmed', platform: 'direct', actual_cost: '240.00' })
      .expect(200);

    const orderItemId = (await pool.query('SELECT id FROM order_item WHERE order_id = $1', [orderId])).rows[0].id;
    await request(app)
      .post(`/api/v1/ops/order-items/${orderItemId}/mark-confirmed`)
      .set('Authorization', `Bearer ${tokenFor(ops)}`)
      .expect(200);

    // 5. Delivery agent checks batches and starts batch
    const myBatches = await request(app)
      .get('/api/v1/delivery/my-batches')
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(200);
    expect(myBatches.body.data.some((b: any) => b.batch_id === batchId)).toBe(true);

    await request(app)
      .post(`/api/v1/delivery/batches/${batchId}/start`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .expect(200);

    const checkOrderOut = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId]);
    expect(checkOrderOut.rows[0].order_status).toBe('out_for_delivery');

    // 6. Delivery agent delivers order using OTP proof
    const phoneLast4 = student.phone.slice(-4);
    const deliverRes = await request(app)
      .post(`/api/v1/delivery/orders/${orderId}/deliver`)
      .set('Authorization', `Bearer ${tokenFor(agent)}`)
      .send({ proof_type: 'otp', proof_value: phoneLast4 })
      .expect(200);

    expect(deliverRes.body.data.order.order_status).toBe('delivered');
    expect(deliverRes.body.data.attempt.result).toBe('delivered');

    const checkFinalOrder = await pool.query('SELECT order_status FROM "order" WHERE id = $1', [orderId]);
    expect(checkFinalOrder.rows[0].order_status).toBe('delivered');

    // Confirm audit_log trail has zero gaps and matches the complete chronological sequence
    const auditRows = await pool.query('SELECT action FROM audit_log WHERE order_id = $1 ORDER BY created_at ASC', [orderId]);
    expect(auditRows.rows.map((r) => r.action)).toEqual([
      'cart.created',
      'cart.items_replaced',
      'order.awaiting_payment',
      'payment.session_created',
      'payment.success',
      'order.locked_by_cutoff_job',
      'order_item.confirmed',
      'order.out_for_delivery',
      'order.delivered'
    ]);
  });
});
