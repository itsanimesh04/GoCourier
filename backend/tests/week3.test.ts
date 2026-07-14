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

const testPort = 30000 + (process.pid % 10000);
const databaseUrl = `postgres://postgres:password@127.0.0.1:${testPort}/postgres`;
const databaseDir = `./.tmp/embedded-postgres-week3-${process.pid}-${Date.now()}`;
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
  const result = await pool.query(
    'INSERT INTO app_user (phone, name, role, campus_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [`8${String(phoneCounter).padStart(9, '0')}`, `${role} user`, role, data.campus_id ?? null]
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

function sendSignedWebhook(payload: unknown) {
  const raw = JSON.stringify(payload);
  return request(app)
    .post('/api/v1/webhooks/payment')
    .set('Content-Type', 'application/json')
    .set('X-Razorpay-Signature', signRawWebhook(raw))
    .send(raw);
}

function mockRazorpayOrder(gatewayOrderId: string) {
  const fetchMock = vi.fn(async () => {
    return new Response(
      JSON.stringify({
        id: gatewayOrderId,
        amount: 14900,
        currency: 'INR',
        receipt: 'receipt',
        status: 'created'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function createAwaitingPaymentOrder(data: { cutoff_time?: string } = {}) {
  const campus = await createCampus({ cutoff_time: data.cutoff_time ?? '23:59:59' });
  const student = await createUser('student', { campus_id: campus.id });
  const restaurant = await createRestaurant(campus.id);
  const item = await createMenuItem(restaurant.id);
  const token = tokenFor(student);

  await request(app)
    .post('/api/v1/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      restaurant_id: restaurant.id,
      items: [{ menu_item_id: item.id, quantity: 1 }]
    })
    .expect(201);

  const orderResponse = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ drop_point: 'Hostel Gate 2' })
    .expect(201);

  return {
    campus,
    student,
    token,
    restaurant,
    item,
    orderId: orderResponse.body.data.order_id as string
  };
}

async function createAwaitingPaymentOrderForRestaurant(data: {
  campusId: string;
  restaurantId: string;
  menuItemId: string;
}) {
  const student = await createUser('student', { campus_id: data.campusId });
  const token = tokenFor(student);

  await request(app)
    .post('/api/v1/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({
      restaurant_id: data.restaurantId,
      items: [{ menu_item_id: data.menuItemId, quantity: 1 }]
    })
    .expect(201);

  const orderResponse = await request(app)
    .post('/api/v1/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({ drop_point: 'Hostel Gate 2' })
    .expect(201);

  return {
    student,
    token,
    orderId: orderResponse.body.data.order_id as string
  };
}

async function seedPlacedOrder(data: {
  campusId: string;
  studentId: string;
  restaurantId: string;
  menuItemId: string;
  placedAt: string;
}) {
  const orderResult = await pool.query(
    `INSERT INTO "order" (
       student_id, campus_id, restaurant_id, drop_point, order_status, payment_status,
       subtotal, fee, total_amount, placed_at
     )
     VALUES ($1, $2, $3, 'Gate 1', 'placed', 'success', '100.00', '0.00', '100.00', $4)
     RETURNING *`,
    [data.studentId, data.campusId, data.restaurantId, data.placedAt]
  );

  await pool.query(
    `INSERT INTO order_item (order_id, menu_item_id, item_name_snap, price_snapshot, quantity)
     VALUES ($1, $2, 'Seed Item', '100.00', 1)`,
    [orderResult.rows[0].id, data.menuItemId]
  );

  return orderResult.rows[0];
}

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

afterAll(async () => {
  await pool?.end();
  await embeddedPostgres?.stop();
});

describe('Week 3 payment initiation', () => {
  it('creates one Razorpay test session before cutoff and reuses it on duplicate pay clicks', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    const fetchMock = mockRazorpayOrder('order_week3_reuse');

    const firstResponse = await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(firstResponse.body.data).toMatchObject({
      gateway: 'razorpay',
      mode: 'test',
      gateway_order_id: 'order_week3_reuse',
      amount: '149.00',
      amount_subunits: 14900,
      currency: 'INR',
      reused: false
    });

    const secondResponse = await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(secondResponse.body.data).toMatchObject({
      gateway_order_id: 'order_week3_reuse',
      reused: true
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const paymentCount = await pool.query('SELECT COUNT(*)::int AS count FROM payment WHERE order_id = $1', [orderId]);
    expect(paymentCount.rows[0].count).toBe(1);
  });

  it('rejects payment initiation after cutoff and rejects another student before creating a session', async () => {
    const { token, orderId, campus } = await createAwaitingPaymentOrder({ cutoff_time: '00:00:00' });
    const otherStudent = await createUser('student', { campus_id: campus.id });
    const otherToken = tokenFor(otherStudent);
    const fetchMock = mockRazorpayOrder('order_should_not_exist');

    await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    const cutoffResponse = await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(cutoffResponse.body.error.message).toBe('Campus cutoff time has passed; payment cannot be initiated');
    expect(fetchMock).not.toHaveBeenCalled();

    const paymentCount = await pool.query('SELECT COUNT(*)::int AS count FROM payment WHERE order_id = $1', [orderId]);
    expect(paymentCount.rows[0].count).toBe(0);
  });

  it('blocks cart replacement after a pending payment session exists', async () => {
    const { token, orderId, restaurant, item } = await createAwaitingPaymentOrder();
    mockRazorpayOrder('order_week3_cart_locked_by_payment');

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);

    const cartResponse = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        restaurant_id: restaurant.id,
        items: [{ menu_item_id: item.id, quantity: 1 }]
      })
      .expect(409);

    expect(cartResponse.body.error.message).toBe('Payment has already been initiated for this cart');
  });

  it('rejects payment initiation if the order snapshot changes during gateway order creation', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    const fetchMock = vi.fn(async () => {
      await pool.query('UPDATE "order" SET subtotal = $2, total_amount = $2 WHERE id = $1', [orderId, '199.00']);

      return new Response(
        JSON.stringify({
          id: 'order_week3_stale_snapshot',
          amount: 14900,
          currency: 'INR',
          receipt: orderId,
          status: 'created'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const response = await request(app)
      .post(`/api/v1/orders/${orderId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(response.body.error.message).toBe('Order changed while payment was being initiated; please retry');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const paymentCount = await pool.query('SELECT COUNT(*)::int AS count FROM payment WHERE order_id = $1', [orderId]);
    expect(paymentCount.rows[0].count).toBe(0);
  });
});

describe('Week 3 payment webhook', () => {
  it('places an order before cutoff and treats the same captured webhook as an idempotent no-op on retry', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    mockRazorpayOrder('order_week3_capture');

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);

    const webhookPayload = capturedWebhook('order_week3_capture', 'pay_week3_once');
    const firstWebhook = await sendSignedWebhook(webhookPayload).expect(200);
    const secondWebhook = await sendSignedWebhook(webhookPayload).expect(200);
    const sameSessionDifferentTxnWebhook = await sendSignedWebhook(
      capturedWebhook('order_week3_capture', 'pay_week3_second')
    ).expect(200);

    expect(firstWebhook.body.data).toMatchObject({
      handled: true,
      duplicate: false,
      order_id: orderId,
      order_status: 'placed',
      payment_status: 'success'
    });
    expect(secondWebhook.body.data).toMatchObject({
      handled: true,
      duplicate: true,
      gateway_txn_id: 'pay_week3_once'
    });
    expect(sameSessionDifferentTxnWebhook.body.data).toMatchObject({
      handled: true,
      duplicate: true,
      gateway_txn_id: 'pay_week3_once'
    });

    const orderResult = await pool.query(
      'SELECT order_status, payment_status, placed_at FROM "order" WHERE id = $1',
      [orderId]
    );
    expect(orderResult.rows[0].order_status).toBe('placed');
    expect(orderResult.rows[0].payment_status).toBe('success');
    expect(orderResult.rows[0].placed_at).toBeTruthy();

    const paymentTxnCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM payment WHERE gateway_txn_id = $1',
      ['pay_week3_once']
    );
    expect(paymentTxnCount.rows[0].count).toBe(1);

    const auditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE order_id = $1
         AND action = 'payment.success'`,
      [orderId]
    );
    expect(auditCount.rows[0].count).toBe(1);
  });

  it('uses the Razorpay event timestamp instead of webhook delivery time for cutoff classification', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder({ cutoff_time: '11:00:00' });
    mockRazorpayOrder('order_week3_delayed_webhook');

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-07-05T10:30:00+05:30'));

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);

    vi.setSystemTime(new Date('2026-07-05T12:00:00+05:30'));
    const eventCreatedAt = Math.floor(new Date('2026-07-05T10:45:00+05:30').getTime() / 1000);
    const webhookResponse = await sendSignedWebhook(
      capturedWebhook('order_week3_delayed_webhook', 'pay_week3_delayed_webhook', {
        createdAt: eventCreatedAt
      })
    ).expect(200);

    expect(webhookResponse.body.data).toMatchObject({
      handled: true,
      duplicate: false,
      order_id: orderId,
      order_status: 'placed',
      payment_status: 'success'
    });

    const orderResult = await pool.query('SELECT order_status, payment_status FROM "order" WHERE id = $1', [orderId]);
    expect(orderResult.rows[0]).toMatchObject({
      order_status: 'placed',
      payment_status: 'success'
    });

    const refundCount = await pool.query('SELECT COUNT(*)::int AS count FROM refund WHERE order_id = $1', [orderId]);
    expect(refundCount.rows[0].count).toBe(0);
  });

  it('marks a captured payment late after cutoff and creates a pending full-order refund', async () => {
    const { token, orderId, campus } = await createAwaitingPaymentOrder();
    mockRazorpayOrder('order_week3_late');

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);
    await pool.query('UPDATE campus SET cutoff_time = $1 WHERE id = $2', ['00:00:00', campus.id]);

    const webhookResponse = await sendSignedWebhook(capturedWebhook('order_week3_late', 'pay_week3_late')).expect(200);
    expect(webhookResponse.body.data).toMatchObject({
      handled: true,
      duplicate: false,
      order_id: orderId,
      order_status: 'cart',
      payment_status: 'late'
    });

    const orderResult = await pool.query(
      'SELECT order_status, payment_status, placed_at FROM "order" WHERE id = $1',
      [orderId]
    );
    expect(orderResult.rows[0]).toMatchObject({
      order_status: 'cart',
      payment_status: 'late',
      placed_at: null
    });

    const refundResult = await pool.query(
      `SELECT status, reason, amount, order_item_id, initiated_by
       FROM refund
       WHERE order_id = $1`,
      [orderId]
    );
    expect(refundResult.rows).toHaveLength(1);
    expect(refundResult.rows[0]).toMatchObject({
      status: 'pending',
      reason: 'payment_after_cutoff',
      amount: '149.00',
      order_item_id: null,
      initiated_by: null
    });

    const refundAuditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE order_id = $1
         AND action = 'refund.created'`,
      [orderId]
    );
    expect(refundAuditCount.rows[0].count).toBe(1);
  });

  it('rejects captured webhooks whose amount does not match the payment session', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    mockRazorpayOrder('order_week3_invalid_amount');

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);

    await sendSignedWebhook(
      capturedWebhook('order_week3_invalid_amount', 'pay_week3_invalid_amount', {
        amount: 14800
      })
    ).expect(400);

    const orderResult = await pool.query('SELECT order_status, payment_status FROM "order" WHERE id = $1', [orderId]);
    expect(orderResult.rows[0]).toMatchObject({
      order_status: 'cart',
      payment_status: 'pending'
    });

    const paymentResult = await pool.query(
      'SELECT gateway_txn_id, status, webhook_payload FROM payment WHERE order_id = $1',
      [orderId]
    );
    expect(paymentResult.rows[0]).toMatchObject({
      gateway_txn_id: null,
      status: 'created',
      webhook_payload: null
    });
  });

  it('acknowledges valid but unsupported webhook events and rejects invalid signatures', async () => {
    const ignoredResponse = await sendSignedWebhook({ event: 'payment.authorized', payload: {} }).expect(200);
    expect(ignoredResponse.body.data).toMatchObject({
      handled: false,
      ignored: true,
      event: 'payment.authorized'
    });

    await request(app)
      .post('/api/v1/webhooks/payment')
      .set('Content-Type', 'application/json')
      .set('X-Razorpay-Signature', 'bad-signature')
      .send(JSON.stringify({ event: 'payment.authorized', payload: {} }))
      .expect(401);
  });
});

describe('Week 3 cutoff job', () => {
  it('can run five times for the same campus date without duplicate batches, tasks, or relocks', async () => {
    const campus = await createCampus({ cutoff_time: '11:00:00' });
    const student = await createUser('student', { campus_id: campus.id });
    const firstRestaurant = await createRestaurant(campus.id, { name: 'First Restaurant' });
    const secondRestaurant = await createRestaurant(campus.id, { name: 'Second Restaurant' });
    const firstItem = await createMenuItem(firstRestaurant.id);
    const secondItem = await createMenuItem(secondRestaurant.id);

    const firstOrder = await seedPlacedOrder({
      campusId: campus.id,
      studentId: student.id,
      restaurantId: firstRestaurant.id,
      menuItemId: firstItem.id,
      placedAt: '2026-07-05T09:00:00+05:30'
    });
    const secondOrder = await seedPlacedOrder({
      campusId: campus.id,
      studentId: student.id,
      restaurantId: firstRestaurant.id,
      menuItemId: firstItem.id,
      placedAt: '2026-07-05T09:15:00+05:30'
    });
    const thirdOrder = await seedPlacedOrder({
      campusId: campus.id,
      studentId: student.id,
      restaurantId: secondRestaurant.id,
      menuItemId: secondItem.id,
      placedAt: '2026-07-05T09:30:00+05:30'
    });

    const now = new Date('2026-07-05T12:00:00+05:30');
    const firstRun = await cutoffJobService.run(now);

    for (let index = 0; index < 4; index += 1) {
      await cutoffJobService.run(now);
    }

    expect(firstRun.results[0]).toMatchObject({
      campus_id: campus.id,
      service_date: '2026-07-05',
      locked_order_count: 3,
      procurement_task_count: 2
    });

    const batchCount = await pool.query('SELECT COUNT(*)::int AS count FROM batch WHERE campus_id = $1', [campus.id]);
    expect(batchCount.rows[0].count).toBe(1);

    const batchResult = await pool.query('SELECT id, batch_status FROM batch WHERE campus_id = $1', [campus.id]);
    expect(batchResult.rows[0].batch_status).toBe('locked');
    const batchId = batchResult.rows[0].id;

    const orderResult = await pool.query(
      `SELECT id, order_status, batch_id
       FROM "order"
       WHERE id = ANY($1::uuid[])
       ORDER BY id ASC`,
      [[firstOrder.id, secondOrder.id, thirdOrder.id]]
    );
    expect(orderResult.rows).toHaveLength(3);
    expect(orderResult.rows.every((row) => row.order_status === 'locked')).toBe(true);
    expect(orderResult.rows.every((row) => row.batch_id === batchId)).toBe(true);

    const taskResult = await pool.query(
      `SELECT restaurant_id
       FROM procurement_task
       WHERE batch_id = $1
       ORDER BY restaurant_id ASC`,
      [batchId]
    );
    expect(taskResult.rows.map((row) => row.restaurant_id).sort()).toEqual(
      [firstRestaurant.id, secondRestaurant.id].sort()
    );

    const runCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM cutoff_job_run WHERE campus_id = $1 AND service_date = $2',
      [campus.id, '2026-07-05']
    );
    expect(runCount.rows[0].count).toBe(5);

    const lockAuditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE action = 'order.locked_by_cutoff_job'
         AND order_id = ANY($1::uuid[])`,
      [[firstOrder.id, secondOrder.id, thirdOrder.id]]
    );
    expect(lockAuditCount.rows[0].count).toBe(3);

    const taskAuditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE action = 'procurement_task.created'
         AND details->>'batch_id' = $1`,
      [batchId]
    );
    expect(taskAuditCount.rows[0].count).toBe(2);
  });

  it('sweeps a webhook straggler into the existing cutoff batch on a later run', async () => {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const campus = await createCampus({ cutoff_time: '11:00:00' });
    const student = await createUser('student', { campus_id: campus.id });
    const firstRestaurant = await createRestaurant(campus.id, { name: 'Covered Restaurant' });
    const stragglerRestaurant = await createRestaurant(campus.id, { name: 'New Restaurant' });
    const firstItem = await createMenuItem(firstRestaurant.id);
    const stragglerItem = await createMenuItem(stragglerRestaurant.id);
    const firstOrder = await seedPlacedOrder({
      campusId: campus.id,
      studentId: student.id,
      restaurantId: firstRestaurant.id,
      menuItemId: firstItem.id,
      placedAt: `${todayStr}T09:00:00+05:30`
    });

    const cutoffNow = new Date(`${todayStr}T12:00:00+05:30`);
    await cutoffJobService.run(cutoffNow);

    const batchResult = await pool.query('SELECT id FROM batch WHERE campus_id = $1 AND service_date = $2', [
      campus.id,
      todayStr
    ]);
    const batchId = batchResult.rows[0].id;

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${todayStr}T10:30:00+05:30`));
    const straggler = await createAwaitingPaymentOrderForRestaurant({
      campusId: campus.id,
      restaurantId: stragglerRestaurant.id,
      menuItemId: stragglerItem.id
    });
    mockRazorpayOrder('order_week3_straggler');
    await request(app)
      .post(`/api/v1/orders/${straggler.orderId}/pay`)
      .set('Authorization', `Bearer ${straggler.token}`)
      .expect(200);
    await sendSignedWebhook(capturedWebhook('order_week3_straggler', 'pay_week3_straggler')).expect(200);
    vi.useRealTimers();

    await cutoffJobService.run(cutoffNow);

    const batchCount = await pool.query('SELECT COUNT(*)::int AS count FROM batch WHERE campus_id = $1', [campus.id]);
    expect(batchCount.rows[0].count).toBe(1);

    const stragglerOrder = await pool.query('SELECT order_status, batch_id FROM "order" WHERE id = $1', [
      straggler.orderId
    ]);
    expect(stragglerOrder.rows[0]).toMatchObject({
      order_status: 'locked',
      batch_id: batchId
    });

    const taskResult = await pool.query(
      `SELECT restaurant_id
       FROM procurement_task
       WHERE batch_id = $1
       ORDER BY restaurant_id ASC`,
      [batchId]
    );
    expect(taskResult.rows.map((row) => row.restaurant_id).sort()).toEqual(
      [firstRestaurant.id, stragglerRestaurant.id].sort()
    );

    const firstOrderLockAudits = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE order_id = $1
         AND action = 'order.locked_by_cutoff_job'`,
      [firstOrder.id]
    );
    expect(firstOrderLockAudits.rows[0].count).toBe(1);

    const stragglerLockAudits = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE order_id = $1
         AND action = 'order.locked_by_cutoff_job'`,
      [straggler.orderId]
    );
    expect(stragglerLockAudits.rows[0].count).toBe(1);

    const runCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM cutoff_job_run WHERE campus_id = $1 AND service_date = $2',
      [campus.id, todayStr]
    );
    expect(runCount.rows[0].count).toBe(2);
  });
});
