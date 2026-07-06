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
});
