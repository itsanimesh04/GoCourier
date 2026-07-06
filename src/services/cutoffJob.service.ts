import type { PoolClient } from 'pg';
import { pool } from '../db/pool';
import { withTransaction } from '../db/transaction';
import { orderRepository } from '../repositories/order.repository';
import { isCutoffPassed, localDateString } from '../utils/campusTime';
import { env } from '../config/env';

interface CampusCutoffRow {
  id: string;
  name: string;
  cutoff_time: string;
}

interface BatchRow {
  id: string;
  campus_id: string;
  service_date: string;
  batch_status: string;
}

interface LockedOrderRow {
  id: string;
  restaurant_id: string;
}

interface ProcurementTaskRow {
  id: string;
  restaurant_id: string;
}

async function getCampusesPastCutoff(now: Date) {
  const result = await pool.query<CampusCutoffRow>(
    `SELECT id, name, cutoff_time
     FROM campus
     WHERE is_active = true
     ORDER BY name ASC`
  );

  return result.rows.filter((campus) => isCutoffPassed(campus.cutoff_time, now));
}

async function insertRunLog(client: PoolClient, campusId: string, serviceDate: string) {
  await client.query(
    `INSERT INTO cutoff_job_run (campus_id, service_date)
     VALUES ($1, $2)`,
    [campusId, serviceDate]
  );
}


async function createOrReuseBatch(client: PoolClient, campusId: string, serviceDate: string) {
  const result = await client.query<BatchRow>(
    `INSERT INTO batch (campus_id, service_date, batch_status, locked_at)
     VALUES ($1, $2, 'locked', now())
     ON CONFLICT (campus_id, service_date)
     DO UPDATE SET
       batch_status = CASE
         WHEN batch.batch_status = 'open' THEN 'locked'::batch_status
         ELSE batch.batch_status
       END,
       locked_at = COALESCE(batch.locked_at, now())
     RETURNING *`,
    [campusId, serviceDate]
  );
  return result.rows[0];
}

async function lockPlacedOrders(client: PoolClient, data: { campusId: string; serviceDate: string; batchId: string }) {
  const result = await client.query<LockedOrderRow>(
    `WITH candidates AS (
       SELECT id
       FROM "order"
       WHERE campus_id = $1
         AND order_status = 'placed'
         AND payment_status = 'success'
         AND batch_id IS NULL
         AND placed_at IS NOT NULL
         AND DATE(placed_at AT TIME ZONE $2) = $3::date
       FOR UPDATE
     )
     UPDATE "order" o
     SET order_status = 'locked',
         batch_id = $4,
         updated_at = now()
     FROM candidates c
     WHERE o.id = c.id
     RETURNING o.id, o.restaurant_id`,
    [data.campusId, env.APP_TIME_ZONE, data.serviceDate, data.batchId]
  );
  return result.rows;
}

async function createProcurementTasks(client: PoolClient, batchId: string) {
  const result = await client.query<ProcurementTaskRow>(
    `WITH restaurants AS (
       SELECT DISTINCT o.restaurant_id
       FROM "order" o
       JOIN order_item oi ON oi.order_id = o.id
       WHERE o.batch_id = $1
         AND o.order_status = 'locked'
     )
     INSERT INTO procurement_task (batch_id, restaurant_id)
     SELECT $1, restaurant_id
     FROM restaurants
     ON CONFLICT (batch_id, restaurant_id) DO NOTHING
     RETURNING id, restaurant_id`,
    [batchId]
  );
  return result.rows;
}

async function processCampus(campus: CampusCutoffRow, serviceDate: string) {
  return withTransaction(async (client) => {
    // Acquire a per-campus advisory lock for the duration of this transaction.
    // If two cron instances run concurrently for the same campus, the second
    // blocks here until the first commits and releases the lock. Once unblocked,
    // the second finds no batch_id=NULL placed orders to lock and exits cleanly.
    // Different campuses use different lock keys, so they run in parallel.
    await client.query(
      `SELECT pg_advisory_xact_lock(('x' || substr(md5($1), 1, 16))::bit(64)::bigint)`,
      [campus.id]
    );

    await insertRunLog(client, campus.id, serviceDate);
    const batch = await createOrReuseBatch(client, campus.id, serviceDate);
    const lockedOrders = await lockPlacedOrders(client, {
      campusId: campus.id,
      serviceDate,
      batchId: batch.id
    });

    for (const order of lockedOrders) {
      await orderRepository.insertAudit(client, {
        order_id: order.id,
        actor_id: null,
        action: 'order.locked_by_cutoff_job',
        details: {
          batch_id: batch.id,
          service_date: serviceDate,
          restaurant_id: order.restaurant_id
        }
      });
    }

    const procurementTasks = await createProcurementTasks(client, batch.id);

    for (const task of procurementTasks) {
      await orderRepository.insertAudit(client, {
        order_id: null,
        actor_id: null,
        action: 'procurement_task.created',
        details: {
          batch_id: batch.id,
          procurement_task_id: task.id,
          restaurant_id: task.restaurant_id,
          service_date: serviceDate
        }
      });
    }

    return {
      campus_id: campus.id,
      service_date: serviceDate,
      batch_id: batch.id,
      locked_order_count: lockedOrders.length,
      procurement_task_count: procurementTasks.length
    };
  });
}


export const cutoffJobService = {
  async run(now = new Date()) {
    const serviceDate = localDateString(now);
    const campuses = await getCampusesPastCutoff(now);
    const results = [];

    for (const campus of campuses) {
      results.push(await processCampus(campus, serviceDate));
    }

    return {
      service_date: serviceDate,
      campus_count: campuses.length,
      results
    };
  },

  async runForCampus(campusId: string, now = new Date()) {
    const serviceDate = localDateString(now);
    const result = await pool.query<CampusCutoffRow>(
      `SELECT id, name, cutoff_time
       FROM campus
       WHERE id = $1
         AND is_active = true
       LIMIT 1`,
      [campusId]
    );
    const campus = result.rows[0];

    if (!campus || !isCutoffPassed(campus.cutoff_time, now)) {
      return {
        service_date: serviceDate,
        campus_count: 0,
        results: []
      };
    }

    return {
      service_date: serviceDate,
      campus_count: 1,
      results: [await processCampus(campus, serviceDate)]
    };
  }
};
