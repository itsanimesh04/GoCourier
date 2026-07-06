import type { PoolClient } from 'pg';
import { pool } from '../db/pool';
import type { OrderRow } from './order.repository';

export interface DeliveryBatchRow {
  batch_id: string;
  campus_id: string;
  campus: string;
  service_date: string;
  batch_status: string;
  total_orders: number;
}

export interface BatchDetailRow {
  id: string;
  campus_id: string;
  service_date: string;
  batch_status: string;
  delivery_agent_id: string | null;
}

export interface DeliveryOrderRow {
  id: string;
  drop_point: string;
  order_status: string;
  student_name: string;
  phone: string;
}

export interface DeliveryOrderItemRow {
  name: string;
  quantity: number;
  item_status: string;
}

export interface DeliveryAttemptRow {
  id: string;
  order_id: string;
  batch_id: string;
  agent_id: string | null;
  result: string;
  proof_type: string | null;
  proof_value: string | null;
  not_delivered_reason: string | null;
  attempted_at: Date;
}

export interface OrderWithStudentRow extends OrderRow {
  student_phone: string;
  student_name: string;
}

export const deliveryRepository = {
  async findMyBatches(agentId: string, dateStr?: string): Promise<DeliveryBatchRow[]> {
    const dateCondition = dateStr ? `AND b.service_date = $2::date` : `AND b.service_date = CURRENT_DATE`;
    const params = dateStr ? [agentId, dateStr] : [agentId];
    const result = await pool.query<DeliveryBatchRow>(
      `SELECT b.id AS batch_id, b.campus_id, c.name AS campus, b.service_date::text, b.batch_status,
              (SELECT COUNT(*)::int FROM "order" o WHERE o.batch_id = b.id AND o.order_status <> 'cancelled') AS total_orders
       FROM batch b
       JOIN campus c ON b.campus_id = c.id
       WHERE (b.delivery_agent_id = $1 OR b.delivery_agent_id IS NULL)
       ${dateCondition}
       ORDER BY b.created_at DESC`,
      params
    );
    return result.rows;
  },

  async findBatchById(batchId: string): Promise<BatchDetailRow | null> {
    const result = await pool.query<BatchDetailRow>(
      `SELECT id, campus_id, service_date::text, batch_status, delivery_agent_id
       FROM batch
       WHERE id = $1`,
      [batchId]
    );
    return result.rows[0] ?? null;
  },

  async findBatchByIdForUpdate(client: PoolClient, batchId: string): Promise<BatchDetailRow | null> {
    const result = await client.query<BatchDetailRow>(
      `SELECT id, campus_id, service_date::text, batch_status, delivery_agent_id
       FROM batch
       WHERE id = $1
       FOR UPDATE`,
      [batchId]
    );
    return result.rows[0] ?? null;
  },

  async findOrdersForBatch(batchId: string): Promise<DeliveryOrderRow[]> {
    const result = await pool.query<DeliveryOrderRow>(
      `SELECT o.id, COALESCE(o.drop_point, 'Default Drop Point') AS drop_point, o.order_status, u.name AS student_name, u.phone
       FROM "order" o
       JOIN app_user u ON o.student_id = u.id
       WHERE o.batch_id = $1 AND o.order_status <> 'cancelled'
       ORDER BY o.created_at ASC`,
      [batchId]
    );
    return result.rows;
  },

  async findOrderItemsForOrder(orderId: string): Promise<DeliveryOrderItemRow[]> {
    const result = await pool.query<DeliveryOrderItemRow>(
      `SELECT item_name_snap AS name, quantity, item_status
       FROM order_item
       WHERE order_id = $1
       ORDER BY item_name_snap ASC`,
      [orderId]
    );
    return result.rows;
  },

  async updateBatchStatus(
    client: PoolClient,
    batchId: string,
    status: string,
    agentId?: string
  ): Promise<{ rowCount: number; batch: BatchDetailRow | null }> {
    const query = agentId
      ? `UPDATE batch SET batch_status = $2::batch_status, delivery_agent_id = COALESCE(delivery_agent_id, $3) WHERE id = $1 AND batch_status <> $2::batch_status RETURNING id, campus_id, service_date::text, batch_status, delivery_agent_id`
      : `UPDATE batch SET batch_status = $2::batch_status WHERE id = $1 AND batch_status <> $2::batch_status RETURNING id, campus_id, service_date::text, batch_status, delivery_agent_id`;
    const params = agentId ? [batchId, status, agentId] : [batchId, status];
    const result = await client.query<BatchDetailRow>(query, params);
    return {
      rowCount: result.rowCount ?? 0,
      batch: result.rows[0] ?? null
    };
  },

  async updateOrdersInBatchToOutForDelivery(client: PoolClient, batchId: string): Promise<OrderRow[]> {
    const result = await client.query<OrderRow>(
      `UPDATE "order"
       SET order_status = 'out_for_delivery', updated_at = now()
       WHERE batch_id = $1 AND order_status IN ('locked', 'procuring', 'confirmed')
       RETURNING *`,
      [batchId]
    );
    return result.rows;
  },

  async findOrderByIdForUpdate(client: PoolClient, orderId: string): Promise<OrderWithStudentRow | null> {
    const result = await client.query<OrderWithStudentRow>(
      `SELECT o.*, u.phone AS student_phone, u.name AS student_name
       FROM "order" o
       JOIN app_user u ON o.student_id = u.id
       WHERE o.id = $1
       FOR UPDATE OF o`,
      [orderId]
    );
    return result.rows[0] ?? null;
  },

  async findLatestOtpForPhone(client: PoolClient, phone: string): Promise<string | null> {
    const result = await client.query<{ otp_code: string }>(
      `SELECT otp_code FROM otp_request WHERE phone = $1 ORDER BY created_at DESC LIMIT 1`,
      [phone]
    );
    return result.rows[0]?.otp_code ?? null;
  },

  async updateOrderStatus(
    client: PoolClient,
    orderId: string,
    status: string
  ): Promise<{ rowCount: number; order: OrderRow | null }> {
    const result = await client.query<OrderRow>(
      `UPDATE "order" SET order_status = $2::order_status, updated_at = now() WHERE id = $1 AND order_status <> $2::order_status RETURNING *`,
      [orderId, status]
    );
    return {
      rowCount: result.rowCount ?? 0,
      order: result.rows[0] ?? null
    };
  },

  async insertDeliveryAttempt(
    client: PoolClient,
    data: { order_id: string; batch_id: string; agent_id: string; result: string; proof_type?: string | null; proof_value?: string | null; not_delivered_reason?: string | null }
  ): Promise<DeliveryAttemptRow> {
    const result = await client.query<DeliveryAttemptRow>(
      `INSERT INTO delivery_attempt (order_id, batch_id, agent_id, result, proof_type, proof_value, not_delivered_reason)
       VALUES ($1, $2, $3, $4::delivery_result, $5, $6, $7)
       RETURNING *`,
      [data.order_id, data.batch_id, data.agent_id, data.result, data.proof_type ?? null, data.proof_value ?? null, data.not_delivered_reason ?? null]
    );
    return result.rows[0];
  },

  async findExistingAttempt(client: PoolClient, orderId: string, resultStatus: string): Promise<DeliveryAttemptRow | null> {
    const result = await client.query<DeliveryAttemptRow>(
      `SELECT * FROM delivery_attempt WHERE order_id = $1 AND result = $2::delivery_result ORDER BY attempted_at DESC LIMIT 1`,
      [orderId, resultStatus]
    );
    return result.rows[0] ?? null;
  }
};
