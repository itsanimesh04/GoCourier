import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import EmbeddedPostgres from 'embedded-postgres';
import request from 'supertest';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSchemaPath } from '../src/db/schema-path';
import type { cutoffJobService as CutoffJobService } from '../src/services/cutoffJob.service';
import type { jwtService as JwtService } from '../src/services/jwt.service';

const testPort = 40000 + (process.pid % 10000);
const databaseUrl = `postgres://postgres:password@127.0.0.1:${testPort}/postgres`;
const databaseDir = `./.tmp/embedded-postgres-week3-concurrency-${process.pid}-${Date.now()}`;
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
    [`7${String(phoneCounter).padStart(9, '0')}`, `${role} user`, role, data.campus_id ?? null]
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

function mockRazorpayOrders(gatewayOrderIds: string[], delayMs = 0) {
  let callCount = 0;
  const fetchMock = vi.fn(async () => {
    const gatewayOrderId = gatewayOrderIds[Math.min(callCount, gatewayOrderIds.length - 1)];
    callCount += 1;

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

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

async function seedOtp(phone: string, otpCode: string) {
  await pool.query(
    `INSERT INTO otp_request (phone, otp_code, expires_at)
     VALUES ($1, $2, $3)`,
    [phone, otpCode, new Date(Date.now() + 10 * 60 * 1000)]
  );
}

beforeEach(async () => {
  await resetDatabase();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

afterAll(async () => {
  await pool?.end();
  await embeddedPostgres?.stop();
});

describe('Week 3 payment and cutoff concurrency', () => {
  it('treats two concurrent webhook deliveries for the same transaction as one state change and one no-op', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    mockRazorpayOrders(['order_concurrency_webhook']);

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);

    const payload = capturedWebhook('order_concurrency_webhook', 'pay_concurrency_duplicate');
    const responses = await Promise.all([sendSignedWebhook(payload).expect(200), sendSignedWebhook(payload).expect(200)]);
    const changedResponses = responses.filter((response) => response.body.data.duplicate === false);
    const duplicateResponses = responses.filter((response) => response.body.data.duplicate === true);

    expect(changedResponses).toHaveLength(1);
    expect(duplicateResponses).toHaveLength(1);

    const orderResult = await pool.query('SELECT order_status, payment_status FROM "order" WHERE id = $1', [orderId]);
    expect(orderResult.rows[0]).toMatchObject({
      order_status: 'placed',
      payment_status: 'success'
    });

    const paymentTxnCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM payment WHERE gateway_txn_id = $1',
      ['pay_concurrency_duplicate']
    );
    expect(paymentTxnCount.rows[0].count).toBe(1);

    const successAuditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE order_id = $1
         AND action = 'payment.success'`,
      [orderId]
    );
    expect(successAuditCount.rows[0].count).toBe(1);
  });

  it('keeps webhook and cutoff races out of the locked plus late state', async () => {
    const { token, orderId, campus } = await createAwaitingPaymentOrder();
    mockRazorpayOrders(['order_concurrency_cutoff']);

    await request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200);
    await pool.query('UPDATE campus SET cutoff_time = $1 WHERE id = $2', ['00:00:00', campus.id]);

    await Promise.all([
      sendSignedWebhook(capturedWebhook('order_concurrency_cutoff', 'pay_concurrency_cutoff')).expect(200),
      cutoffJobService.runForCampus(campus.id, new Date('2026-07-05T12:00:00+05:30'))
    ]);

    const orderResult = await pool.query('SELECT order_status, payment_status FROM "order" WHERE id = $1', [orderId]);
    const finalOrder = orderResult.rows[0];
    const refundResult = await pool.query(
      `SELECT status, reason, amount
       FROM refund
       WHERE order_id = $1`,
      [orderId]
    );

    expect(finalOrder).not.toMatchObject({
      order_status: 'locked',
      payment_status: 'late'
    });

    const isLockedSuccess = finalOrder.order_status === 'locked' && finalOrder.payment_status === 'success';
    const isCartLateWithRefund =
      finalOrder.order_status === 'cart' &&
      finalOrder.payment_status === 'late' &&
      refundResult.rows.length === 1 &&
      refundResult.rows[0].status === 'pending' &&
      refundResult.rows[0].reason === 'payment_after_cutoff';

    expect(isLockedSuccess || isCartLateWithRefund).toBe(true);
  });

  it('creates one payment row when two payment initiations race for the same order', async () => {
    const { token, orderId } = await createAwaitingPaymentOrder();
    const fetchMock = mockRazorpayOrders(['order_concurrency_pay_1', 'order_concurrency_pay_2'], 20);

    const responses = await Promise.all([
      request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200),
      request(app).post(`/api/v1/orders/${orderId}/pay`).set('Authorization', `Bearer ${token}`).expect(200)
    ]);

    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(2);

    const paymentResult = await pool.query(
      `SELECT gateway_order_id, status
       FROM payment
       WHERE order_id = $1`,
      [orderId]
    );
    expect(paymentResult.rows).toHaveLength(1);
    expect(paymentResult.rows[0].status).toBe('created');

    for (const response of responses) {
      expect(response.body.data.gateway_order_id).toBe(paymentResult.rows[0].gateway_order_id);
    }
  });

  it('creates one batch when two cutoff runs race for the same campus and service date', async () => {
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
    const results = await Promise.all([
      cutoffJobService.runForCampus(campus.id, now),
      cutoffJobService.runForCampus(campus.id, now)
    ]);

    const totalLockedCount = results
      .flatMap((result) => result.results)
      .reduce((sum, result) => sum + result.locked_order_count, 0);
    expect(totalLockedCount).toBe(3);

    const batchCount = await pool.query('SELECT COUNT(*)::int AS count FROM batch WHERE campus_id = $1', [campus.id]);
    expect(batchCount.rows[0].count).toBe(1);

    const batchResult = await pool.query('SELECT id FROM batch WHERE campus_id = $1', [campus.id]);
    const batchId = batchResult.rows[0].id;

    const orderResult = await pool.query(
      `SELECT order_status, payment_status, batch_id
       FROM "order"
       WHERE id = ANY($1::uuid[])`,
      [[firstOrder.id, secondOrder.id, thirdOrder.id]]
    );
    expect(orderResult.rows).toHaveLength(3);
    expect(orderResult.rows.every((row) => row.order_status === 'locked')).toBe(true);
    expect(orderResult.rows.every((row) => row.payment_status === 'success')).toBe(true);
    expect(orderResult.rows.every((row) => row.batch_id === batchId)).toBe(true);

    const lockAuditCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM audit_log
       WHERE action = 'order.locked_by_cutoff_job'
         AND order_id = ANY($1::uuid[])`,
      [[firstOrder.id, secondOrder.id, thirdOrder.id]]
    );
    expect(lockAuditCount.rows[0].count).toBe(3);

    const runCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM cutoff_job_run WHERE campus_id = $1 AND service_date = $2',
      [campus.id, '2026-07-05']
    );
    expect(runCount.rows[0].count).toBe(2);
  });
});

describe('Week 3 auth concurrency hardening', () => {
  it('allows only one concurrent verify for the same OTP', async () => {
    const phone = '7111111111';
    await seedOtp(phone, '1234');

    const responses = await Promise.all([
      request(app).post('/api/v1/auth/otp/verify').send({ phone, otp_code: '1234' }),
      request(app).post('/api/v1/auth/otp/verify').send({ phone, otp_code: '1234' })
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 401]);

    const userCount = await pool.query('SELECT COUNT(*)::int AS count FROM app_user WHERE phone = $1', [phone]);
    expect(userCount.rows[0].count).toBe(1);

    const verifiedCount = await pool.query(
      'SELECT COUNT(*)::int AS count FROM otp_request WHERE phone = $1 AND verified_at IS NOT NULL',
      [phone]
    );
    expect(verifiedCount.rows[0].count).toBe(1);
  });

  it('does not create duplicate users when two valid first-time OTPs verify concurrently', async () => {
    const phone = '7222222222';
    await seedOtp(phone, '1111');
    await seedOtp(phone, '2222');

    const responses = await Promise.all([
      request(app).post('/api/v1/auth/otp/verify').send({ phone, otp_code: '1111' }),
      request(app).post('/api/v1/auth/otp/verify').send({ phone, otp_code: '2222' })
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 200]);

    const userCount = await pool.query('SELECT COUNT(*)::int AS count FROM app_user WHERE phone = $1', [phone]);
    expect(userCount.rows[0].count).toBe(1);
    expect(responses[0].body.data.user.id).toBe(responses[1].body.data.user.id);
  });
});
