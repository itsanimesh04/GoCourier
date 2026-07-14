import { readFile } from 'node:fs/promises';
import EmbeddedPostgres from 'embedded-postgres';
import request from 'supertest';
import type { Express } from 'express';
import type { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getSchemaPath } from '../src/db/schema-path';
import type { jwtService as JwtService } from '../src/services/jwt.service';

const testPort = 20000 + (process.pid % 10000);
const databaseUrl = `postgres://postgres:password@127.0.0.1:${testPort}/postgres`;
const databaseDir = `./.tmp/embedded-postgres-${process.pid}-${Date.now()}`;

let embeddedPostgres: EmbeddedPostgres;
let app: Express;
let pool: Pool;
let jwtService: typeof JwtService;
let phoneCounter = 0;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough';

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

  app = appModule.createApp();
  pool = poolModule.pool;
  jwtService = jwtModule.jwtService;
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
    [`9${String(phoneCounter).padStart(9, '0')}`, `${role} user`, role, data.campus_id ?? null]
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
      data.cutoff_time ?? '17:00',
      data.delivery_time ?? '19:00',
      data.is_active ?? true
    ]
  );
  return result.rows[0];
}

async function createRestaurant(
  campusId: string,
  data: {
    name?: string;
    is_active?: boolean;
    manual_priority?: number;
    commission_rate?: string;
  } = {}
) {
  const result = await pool.query(
    `INSERT INTO restaurant (campus_id, name, is_active, manual_priority, commission_rate)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      campusId,
      data.name ?? 'Burger Farm',
      data.is_active ?? true,
      data.manual_priority ?? 0,
      data.commission_rate ?? '0.00'
    ]
  );
  return result.rows[0];
}

async function createMenuItem(
  restaurantId: string,
  data: {
    name?: string;
    price?: string;
    is_veg?: boolean;
    is_available?: boolean;
  } = {}
) {
  const result = await pool.query(
    `INSERT INTO menu_item (restaurant_id, name, price, is_veg, is_available)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      restaurantId,
      data.name ?? 'Classic Burger',
      data.price ?? '149.00',
      data.is_veg ?? true,
      data.is_available ?? true
    ]
  );
  return result.rows[0];
}

async function createOrder(
  studentId: string,
  campusId: string,
  restaurantId: string,
  data: {
    drop_point?: string | null;
    order_status?: string;
    payment_status?: string;
    subtotal?: string;
    fee?: string;
    total_amount?: string;
    placed_at?: string | null;
    created_at?: string;
    batch_id?: string | null;
  } = {}
) {
  const result = await pool.query(
    `INSERT INTO "order" (
       student_id, campus_id, restaurant_id, batch_id, drop_point,
       order_status, payment_status, subtotal, fee, total_amount, placed_at, created_at, updated_at
     )
     VALUES (
       $1, $2, $3, $4, $5,
       $6::order_status, $7::payment_status, $8::numeric, $9::numeric, $10::numeric,
       $11::timestamptz, COALESCE($12::timestamptz, now()), COALESCE($12::timestamptz, now())
     )
     RETURNING *`,
    [
      studentId,
      campusId,
      restaurantId,
      data.batch_id ?? null,
      Object.prototype.hasOwnProperty.call(data, 'drop_point') ? data.drop_point : 'Hostel Gate 2',
      data.order_status ?? 'placed',
      data.payment_status ?? 'success',
      data.subtotal ?? '149.00',
      data.fee ?? '0.00',
      data.total_amount ?? '149.00',
      data.placed_at ?? data.created_at ?? null,
      data.created_at ?? null
    ]
  );
  return result.rows[0];
}

async function createOrderItem(
  orderId: string,
  menuItem: { id: string; name: string; price: string },
  data: { quantity?: number; item_status?: string; refund_amount?: string } = {}
) {
  const result = await pool.query(
    `INSERT INTO order_item (
       order_id, menu_item_id, item_name_snap, price_snapshot, quantity, item_status, refund_amount
     )
     VALUES ($1, $2, $3, $4::numeric, $5, $6::order_item_status, $7::numeric)
     RETURNING *`,
    [
      orderId,
      menuItem.id,
      menuItem.name,
      menuItem.price,
      data.quantity ?? 1,
      data.item_status ?? 'pending',
      data.refund_amount ?? '0.00'
    ]
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

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await pool?.end();
  await embeddedPostgres?.stop();
});

describe('Week 1 auth and role access', () => {
  it('requests an OTP, verifies it, creates a student user, and returns a JWT with role context', async () => {
    const phone = '9876543210';

    await request(app).post('/api/v1/auth/otp/request').send({ phone }).expect(201);

    const otpResult = await pool.query(
      'SELECT otp_code FROM otp_request WHERE phone = $1 ORDER BY created_at DESC LIMIT 1',
      [phone]
    );

    const otpCode = otpResult.rows[0].otp_code;

    const verifyResponse = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({ phone, otp_code: otpCode })
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.data.user).toMatchObject({
      phone,
      role: 'student',
      campus_id: null
    });

    const payload = jwtService.verify(verifyResponse.body.data.token);
    expect(payload).toMatchObject({
      id: verifyResponse.body.data.user.id,
      role: 'student',
      campus_id: null
    });
  });

  it('returns 401 without a token and 403 when a student token hits admin or ops routes', async () => {
    const student = await createUser('student');
    const studentToken = tokenFor(student);
    const ops = await createUser('ops');
    const opsToken = tokenFor(ops);

    await request(app)
      .post('/api/v1/admin/campuses')
      .send({ name: 'Poornima University', city: 'Jaipur', cutoff_time: '17:00', delivery_time: '19:00' })
      .expect(401);

    await request(app)
      .post('/api/v1/admin/campuses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Poornima University', city: 'Jaipur', cutoff_time: '17:00', delivery_time: '19:00' })
      .expect(403);

    await request(app)
      .get('/api/v1/ops/health')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);

    const opsResponse = await request(app)
      .get('/api/v1/ops/health')
      .set('Authorization', `Bearer ${opsToken}`)
      .expect(200);

    expect(opsResponse.body.data).toMatchObject({ status: 'ok' });
  });
});

describe('Week 1 admin CRUD', () => {
  it('creates and updates campus, restaurant, and menu item records through admin-only endpoints', async () => {
    const admin = await createUser('admin');
    const adminToken = tokenFor(admin);

    const campusResponse = await request(app)
      .post('/api/v1/admin/campuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Poornima University', city: 'Jaipur', cutoff_time: '17:00', delivery_time: '19:00' })
      .expect(201);

    const campus = campusResponse.body.data;
    expect(campus).toMatchObject({
      name: 'Poornima University',
      city: 'Jaipur',
      cutoff_time: '17:00:00',
      delivery_time: '19:00:00',
      is_active: true
    });

    const updatedCampusResponse = await request(app)
      .patch(`/api/v1/admin/campuses/${campus.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ cutoff_time: '16:30' })
      .expect(200);
    expect(updatedCampusResponse.body.data.cutoff_time).toBe('16:30:00');

    const restaurantResponse = await request(app)
      .post('/api/v1/admin/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        campus_id: campus.id,
        name: 'Burger Farm',
        commission_rate: '5.50',
        manual_priority: 2,
        refund_risk_penalty: '0.00'
      })
      .expect(201);

    const restaurant = restaurantResponse.body.data;
    expect(restaurant).toMatchObject({
      campus_id: campus.id,
      name: 'Burger Farm',
      commission_rate: '5.50',
      manual_priority: 2,
      refund_risk_penalty: '0.00'
    });

    const updatedRestaurantResponse = await request(app)
      .patch(`/api/v1/admin/restaurants/${restaurant.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ manual_priority: 3, is_active: false })
      .expect(200);
    expect(updatedRestaurantResponse.body.data).toMatchObject({
      manual_priority: 3,
      is_active: false
    });

    const menuItemResponse = await request(app)
      .post(`/api/v1/admin/restaurants/${restaurant.id}/menu-items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Classic Burger', price: '149.00', is_veg: false })
      .expect(201);

    const menuItem = menuItemResponse.body.data;
    expect(menuItem).toMatchObject({
      restaurant_id: restaurant.id,
      name: 'Classic Burger',
      price: '149.00',
      is_veg: false,
      is_available: true
    });

    const updatedMenuItemResponse = await request(app)
      .patch(`/api/v1/admin/menu-items/${menuItem.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: '159.00', is_available: false })
      .expect(200);
    expect(updatedMenuItemResponse.body.data).toMatchObject({
      price: '159.00',
      is_available: false
    });
  });

  it('validates input and rejects restaurant/menu item writes without valid parent scope', async () => {
    const admin = await createUser('admin');
    const adminToken = tokenFor(admin);
    const missingUuid = '11111111-1111-1111-1111-111111111111';

    await request(app)
      .post('/api/v1/admin/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ campus_id: missingUuid, name: 'Missing Campus Restaurant' })
      .expect(404);

    await request(app)
      .post(`/api/v1/admin/restaurants/${missingUuid}/menu-items`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Ghost Item', price: '99.00' })
      .expect(404);

    await request(app)
      .post('/api/v1/admin/campuses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '', city: 'Jaipur', cutoff_time: '25:00', delivery_time: '19:00' })
      .expect(400);
  });
});

describe('Week 2 customer flow', () => {
  it('lists active campuses and lets a student set their default campus', async () => {
    const alphaCampus = await createCampus({ name: 'Alpha Campus' });
    const betaCampus = await createCampus({ name: 'Beta Campus' });
    await createCampus({ name: 'Closed Campus', is_active: false });
    const student = await createUser('student');
    const studentToken = tokenFor(student);

    const campusesResponse = await request(app)
      .get('/api/v1/campuses')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(campusesResponse.body.data.map((campus: { name: string }) => campus.name)).toEqual([
      'Alpha Campus',
      'Beta Campus'
    ]);

    const setCampusResponse = await request(app)
      .post('/api/v1/me/campus')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ campus_id: betaCampus.id })
      .expect(200);

    expect(setCampusResponse.body.data).toMatchObject({
      id: student.id,
      campus_id: betaCampus.id
    });

    const dbUser = await pool.query('SELECT campus_id FROM app_user WHERE id = $1', [student.id]);
    expect(dbUser.rows[0].campus_id).toBe(betaCampus.id);

    await request(app)
      .post('/api/v1/me/campus')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ campus_id: alphaCampus.id })
      .expect(200);
  });

  it('lists and searches active restaurants by campus and returns scoped menu availability flags', async () => {
    const campus = await createCampus({ name: 'Poornima University' });
    const otherCampus = await createCampus({ name: 'Other Campus' });
    const student = await createUser('student', { campus_id: campus.id });
    const studentToken = tokenFor(student);
    const burgerHouse = await createRestaurant(campus.id, { name: 'Burger House', manual_priority: 2, commission_rate: '9.50' });
    const campusCafe = await createRestaurant(campus.id, { name: 'Campus Cafe' });
    await createRestaurant(campus.id, { name: 'Inactive Cafe', is_active: false });
    const otherRestaurant = await createRestaurant(otherCampus.id, { name: 'Other Campus Cafe' });
    await createMenuItem(burgerHouse.id, { name: 'Classic Burger', price: '149.00' });
    await createMenuItem(campusCafe.id, { name: 'Burger Roll', price: '89.00' });
    await createMenuItem(campusCafe.id, { name: 'Cold Coffee', price: '69.00', is_available: false });

    const listResponse = await request(app)
      .get(`/api/v1/restaurants?campus_id=${campus.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(listResponse.body.data.map((restaurant: { name: string }) => restaurant.name)).toEqual([
      'Burger House',
      'Campus Cafe'
    ]);
    expect(listResponse.body.data[0]).toMatchObject({
      name: 'Burger House',
      is_promoted: true,
      offer_badges: [],
      availability_confidence: null
    });
    expect(listResponse.body.data[0].commission_rate).toBeUndefined();

    const searchResponse = await request(app)
      .get(`/api/v1/restaurants?campus_id=${campus.id}&q=burger`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(searchResponse.body.data.map((restaurant: { name: string }) => restaurant.name)).toEqual([
      'Burger House',
      'Campus Cafe'
    ]);

    const menuResponse = await request(app)
      .get(`/api/v1/restaurants/${campusCafe.id}/menu`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(menuResponse.body.data.restaurant).toMatchObject({
      id: campusCafe.id,
      campus_id: campus.id,
      name: 'Campus Cafe'
    });
    expect(menuResponse.body.data.items).toEqual([
      expect.objectContaining({ name: 'Burger Roll', is_available: true }),
      expect.objectContaining({ name: 'Cold Coffee', is_available: false })
    ]);

    await request(app)
      .get(`/api/v1/restaurants/${otherRestaurant.id}/menu`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(404);
  });

  it('creates, replaces, totals, and blocks a single-restaurant cart without placeholder drop points', async () => {
    const campus = await createCampus({ cutoff_time: '16:30', delivery_time: '18:45' });
    const student = await createUser('student', { campus_id: campus.id });
    const studentToken = tokenFor(student);
    const firstRestaurant = await createRestaurant(campus.id, { name: 'First Restaurant' });
    const secondRestaurant = await createRestaurant(campus.id, { name: 'Second Restaurant' });
    const burger = await createMenuItem(firstRestaurant.id, { name: 'Burger', price: '99.50' });
    const fries = await createMenuItem(firstRestaurant.id, { name: 'Fries', price: '40.00' });
    const momo = await createMenuItem(secondRestaurant.id, { name: 'Momo', price: '80.00' });

    const cartResponse = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: firstRestaurant.id,
        items: [
          { menu_item_id: burger.id, quantity: 2 },
          { menu_item_id: fries.id, quantity: 1 }
        ]
      })
      .expect(201);

    expect(cartResponse.body.data).toMatchObject({
      drop_point: null,
      subtotal: '239.00',
      fee: '0.00',
      total_amount: '239.00',
      campus: {
        id: campus.id,
        cutoff_time: '16:30:00',
        delivery_time: '18:45:00'
      },
      restaurant: {
        id: firstRestaurant.id,
        name: 'First Restaurant'
      }
    });
    expect(cartResponse.body.data.items).toEqual([
      expect.objectContaining({ name: 'Burger', quantity: 2, line_total: '199.00' }),
      expect.objectContaining({ name: 'Fries', quantity: 1, line_total: '40.00' })
    ]);

    const dbCart = await pool.query('SELECT drop_point FROM "order" WHERE id = $1', [cartResponse.body.data.id]);
    expect(dbCart.rows[0].drop_point).toBeNull();

    const replacedCartResponse = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: firstRestaurant.id,
        items: [{ menu_item_id: burger.id, quantity: 1 }]
      })
      .expect(201);

    expect(replacedCartResponse.body.data).toMatchObject({
      id: cartResponse.body.data.id,
      subtotal: '99.50',
      total_amount: '99.50'
    });
    expect(replacedCartResponse.body.data.items).toHaveLength(1);

    const conflictResponse = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: secondRestaurant.id,
        items: [{ menu_item_id: momo.id, quantity: 1 }]
      })
      .expect(409);

    expect(conflictResponse.body.error.message).toBe('clear cart to switch restaurants');

    const switchedCartResponse = await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: secondRestaurant.id,
        force_replace: true,
        items: [{ menu_item_id: momo.id, quantity: 1 }]
      })
      .expect(201);

    expect(switchedCartResponse.body.data).toMatchObject({
      id: cartResponse.body.data.id,
      subtotal: '80.00',
      total_amount: '80.00',
      restaurant: {
        id: secondRestaurant.id,
        name: 'Second Restaurant'
      }
    });
    expect(switchedCartResponse.body.data.items).toEqual([
      expect.objectContaining({ name: 'Momo', quantity: 1, line_total: '80.00' })
    ]);
  });

  it('rejects invalid cart quantities, unavailable items, and menu items outside the restaurant', async () => {
    const campus = await createCampus();
    const student = await createUser('student', { campus_id: campus.id });
    const studentToken = tokenFor(student);
    const restaurant = await createRestaurant(campus.id);
    const otherRestaurant = await createRestaurant(campus.id, { name: 'Other Restaurant' });
    const item = await createMenuItem(restaurant.id, { name: 'Available Item' });
    const unavailableItem = await createMenuItem(restaurant.id, { name: 'Unavailable Item', is_available: false });
    const otherItem = await createMenuItem(otherRestaurant.id, { name: 'Other Item' });

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: restaurant.id,
        items: [{ menu_item_id: item.id, quantity: 0 }]
      })
      .expect(400);

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: restaurant.id,
        items: [{ menu_item_id: unavailableItem.id, quantity: 1 }]
      })
      .expect(400);

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: restaurant.id,
        items: [{ menu_item_id: otherItem.id, quantity: 1 }]
      })
      .expect(404);
  });

  it('converts the cart into an awaiting-payment order with a real drop point and cart status preserved', async () => {
    const campus = await createCampus();
    const student = await createUser('student', { campus_id: campus.id });
    const studentToken = tokenFor(student);
    const restaurant = await createRestaurant(campus.id);
    const item = await createMenuItem(restaurant.id, { price: '120.00' });

    await request(app)
      .post('/api/v1/cart')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        restaurant_id: restaurant.id,
        items: [{ menu_item_id: item.id, quantity: 1 }]
      })
      .expect(201);

    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ drop_point: '   ' })
      .expect(400);

    const orderResponse = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ drop_point: 'Hostel Gate 2' })
      .expect(201);

    expect(orderResponse.body.data).toMatchObject({
      total_amount: '120.00'
    });
    expect(orderResponse.body.data.order_id).toBeTruthy();

    const orderResult = await pool.query(
      'SELECT drop_point, order_status, payment_status, total_amount FROM "order" WHERE id = $1',
      [orderResponse.body.data.order_id]
    );
    expect(orderResult.rows[0]).toMatchObject({
      drop_point: 'Hostel Gate 2',
      order_status: 'cart',
      payment_status: 'pending',
      total_amount: '120.00'
    });

    const auditResult = await pool.query('SELECT action FROM audit_log WHERE order_id = $1 ORDER BY created_at ASC', [
      orderResponse.body.data.order_id
    ]);
    expect(auditResult.rows.map((row) => row.action)).toContain('order.awaiting_payment');
  });

  it('returns full customer order detail only to the owning student without leaking proof values', async () => {
    const campus = await createCampus({ cutoff_time: '16:30', delivery_time: '18:45' });
    const student = await createUser('student', { campus_id: campus.id });
    const otherStudent = await createUser('student', { campus_id: campus.id });
    const agent = await createUser('delivery_agent', { campus_id: campus.id });
    const restaurant = await createRestaurant(campus.id, { name: 'Tracking Cafe' });
    const pizza = await createMenuItem(restaurant.id, { name: 'Paneer Pizza', price: '100.00' });
    const bread = await createMenuItem(restaurant.id, { name: 'Garlic Bread', price: '79.00' });

    const batch = await pool.query(
      `INSERT INTO batch (campus_id, service_date, batch_status, delivery_agent_id)
       VALUES ($1, CURRENT_DATE, 'out_for_delivery', $2)
       RETURNING *`,
      [campus.id, agent.id]
    );
    const order = await createOrder(student.id, campus.id, restaurant.id, {
      batch_id: batch.rows[0].id,
      order_status: 'out_for_delivery',
      payment_status: 'partially_refunded',
      subtotal: '279.00',
      fee: '20.00',
      total_amount: '299.00',
      placed_at: '2026-01-01T10:00:00Z'
    });
    const confirmedItem = await createOrderItem(order.id, pizza, { quantity: 2, item_status: 'confirmed' });
    const unavailableItem = await createOrderItem(order.id, bread, {
      quantity: 1,
      item_status: 'unavailable',
      refund_amount: '79.00'
    });
    await pool.query(
      `INSERT INTO refund (order_id, order_item_id, amount, reason, status, gateway_refund_id)
       VALUES ($1, $2, '79.00', 'Item unavailable', 'processed', 'rfnd_public_id')`,
      [order.id, unavailableItem.id]
    );
    await pool.query(
      `INSERT INTO delivery_attempt (
         order_id, batch_id, agent_id, result, proof_type, proof_value, not_delivered_reason
       )
       VALUES ($1, $2, $3, 'not_delivered', 'otp', '1234-secret', 'Student unavailable')`,
      [order.id, batch.rows[0].id, agent.id]
    );

    const detailResponse = await request(app)
      .get(`/api/v1/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200);

    expect(detailResponse.body.data).toMatchObject({
      id: order.id,
      order_status: 'out_for_delivery',
      payment_status: 'partially_refunded',
      drop_point: 'Hostel Gate 2',
      subtotal: '279.00',
      fee: '20.00',
      total_amount: '299.00',
      campus: {
        id: campus.id,
        name: campus.name,
        city: campus.city,
        cutoff_time: '16:30:00',
        delivery_time: '18:45:00'
      },
      restaurant: {
        id: restaurant.id,
        name: 'Tracking Cafe'
      },
      batch: {
        id: batch.rows[0].id,
        batch_status: 'out_for_delivery',
        delivery_agent_id: agent.id
      }
    });
    expect(detailResponse.body.data.items).toEqual([
      expect.objectContaining({
        id: unavailableItem.id,
        name: 'Garlic Bread',
        item_status: 'unavailable',
        refund_amount: '79.00',
        refunds: [expect.objectContaining({ amount: '79.00', status: 'processed' })]
      }),
      expect.objectContaining({
        id: confirmedItem.id,
        name: 'Paneer Pizza',
        quantity: 2,
        line_total: '200.00',
        item_status: 'confirmed',
        refunds: []
      })
    ]);
    expect(detailResponse.body.data.refunds).toEqual([
      expect.objectContaining({ order_item_id: unavailableItem.id, gateway_refund_id: 'rfnd_public_id' })
    ]);
    expect(detailResponse.body.data.delivery_attempts).toEqual([
      expect.objectContaining({
        result: 'not_delivered',
        proof_type: 'otp',
        not_delivered_reason: 'Student unavailable'
      })
    ]);
    expect(detailResponse.body.data.delivery_attempts[0].proof_value).toBeUndefined();

    await request(app)
      .get(`/api/v1/orders/${order.id}`)
      .set('Authorization', `Bearer ${tokenFor(otherStudent)}`)
      .expect(403);

    await request(app)
      .get('/api/v1/orders/11111111-1111-1111-1111-111111111111')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(404);
  });

  it('lists only the logged-in student orders with pagination, newest first, excluding untouched carts', async () => {
    const campus = await createCampus();
    const student = await createUser('student', { campus_id: campus.id });
    const otherStudent = await createUser('student', { campus_id: campus.id });
    const admin = await createUser('admin', { campus_id: campus.id });
    const restaurant = await createRestaurant(campus.id, { name: 'List Cafe' });
    const item = await createMenuItem(restaurant.id, { name: 'Combo', price: '120.00' });

    const oldOrder = await createOrder(student.id, campus.id, restaurant.id, {
      total_amount: '120.00',
      created_at: '2026-01-01T10:00:00Z'
    });
    const middleOrder = await createOrder(student.id, campus.id, restaurant.id, {
      total_amount: '130.00',
      created_at: '2026-01-02T10:00:00Z'
    });
    const newestOrder = await createOrder(student.id, campus.id, restaurant.id, {
      total_amount: '140.00',
      created_at: '2026-01-03T10:00:00Z'
    });
    const otherOrder = await createOrder(otherStudent.id, campus.id, restaurant.id, {
      total_amount: '150.00',
      created_at: '2026-01-04T10:00:00Z'
    });
    const untouchedCart = await createOrder(student.id, campus.id, restaurant.id, {
      drop_point: null,
      order_status: 'cart',
      payment_status: 'pending',
      created_at: '2026-01-05T10:00:00Z'
    });

    for (const order of [oldOrder, middleOrder, newestOrder, otherOrder, untouchedCart]) {
      await createOrderItem(order.id, item);
    }

    await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(403);

    const listResponse = await request(app)
      .get('/api/v1/orders?page=1&limit=2')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200);

    expect(listResponse.body.data.orders.map((order: { id: string }) => order.id)).toEqual([
      newestOrder.id,
      middleOrder.id
    ]);
    expect(listResponse.body.data.orders[0]).toMatchObject({
      id: newestOrder.id,
      total_amount: '140.00',
      item_count: 1,
      restaurant: { id: restaurant.id, name: 'List Cafe' },
      campus: { id: campus.id, name: campus.name, city: campus.city }
    });
    expect(listResponse.body.data.orders.map((order: { id: string }) => order.id)).not.toContain(otherOrder.id);
    expect(listResponse.body.data.orders.map((order: { id: string }) => order.id)).not.toContain(untouchedCart.id);
    expect(listResponse.body.data.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 3,
      total_pages: 2,
      has_next: true
    });

    const secondPageResponse = await request(app)
      .get('/api/v1/orders?page=2&limit=2')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200);

    expect(secondPageResponse.body.data.orders.map((order: { id: string }) => order.id)).toEqual([oldOrder.id]);
    expect(secondPageResponse.body.data.pagination.has_next).toBe(false);
  });
});
