import type { PoolClient } from 'pg';
import { pool } from '../db/pool';

export interface BatchSummaryRow {
  batch_id: string;
  campus: string;
  total_orders: number;
}

export interface BatchRestaurantRow {
  restaurant_id: string;
  name: string;
}

export interface BatchItemRow {
  menu_item_name: string;
  total_quantity: number;
}

export interface ProcurementTaskRow {
  id: string;
  batch_id: string;
  restaurant_id: string;
  status: string;
  external_order_ref: string | null;
  actual_cost: string | null;
  platform: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_status: string;
  price_snapshot: string;
  quantity: number;
  refund_amount: string | null;
}

export interface RefundRow {
  id: string;
  order_id: string;
  order_item_id: string | null;
  amount: string;
  reason: string;
  status: string;
  gateway_refund_id: string | null;
  initiated_by: string | null;
  created_at: Date;
  processed_at: Date | null;
}

export const opsRepository = {
  async findBatchSummaryById(batchId: string): Promise<BatchSummaryRow | null> {
    const result = await pool.query<BatchSummaryRow>(
      `SELECT b.id AS batch_id, c.name AS campus,
              (SELECT COUNT(*)::int FROM "order" o WHERE o.batch_id = b.id AND o.order_status <> 'cancelled') AS total_orders
       FROM batch b
       JOIN campus c ON b.campus_id = c.id
       WHERE b.id = $1`,
      [batchId]
    );
    return result.rows[0] ?? null;
  },

  async findBatchRestaurants(batchId: string): Promise<BatchRestaurantRow[]> {
    const result = await pool.query<BatchRestaurantRow>(
      `SELECT DISTINCT r.id AS restaurant_id, r.name
       FROM "order" o
       JOIN restaurant r ON o.restaurant_id = r.id
       WHERE o.batch_id = $1 AND o.order_status <> 'cancelled'
       UNION
       SELECT DISTINCT r.id AS restaurant_id, r.name
       FROM procurement_task pt
       JOIN restaurant r ON pt.restaurant_id = r.id
       WHERE pt.batch_id = $1
       ORDER BY name ASC`,
      [batchId]
    );
    return result.rows;
  },

  async findRestaurantItemsForBatch(batchId: string, restaurantId: string): Promise<BatchItemRow[]> {
    const result = await pool.query<BatchItemRow>(
      `SELECT oi.item_name_snap AS menu_item_name, SUM(oi.quantity)::int AS total_quantity
       FROM order_item oi
       JOIN "order" o ON oi.order_id = o.id
       WHERE o.batch_id = $1
         AND o.restaurant_id = $2
         AND oi.item_status IN ('pending', 'confirmed')
         AND o.order_status <> 'cancelled'
       GROUP BY oi.item_name_snap
       ORDER BY oi.item_name_snap ASC`,
      [batchId, restaurantId]
    );
    return result.rows;
  },

  async findProcurementTask(batchId: string, restaurantId: string): Promise<ProcurementTaskRow | null> {
    const result = await pool.query<ProcurementTaskRow>(
      `SELECT id, batch_id, restaurant_id, status, external_order_ref, actual_cost, platform
       FROM procurement_task
       WHERE batch_id = $1 AND restaurant_id = $2
       LIMIT 1`,
      [batchId, restaurantId]
    );
    return result.rows[0] ?? null;
  },

  async findProcurementTaskByIdForUpdate(client: PoolClient, taskId: string): Promise<ProcurementTaskRow | null> {
    const result = await client.query<ProcurementTaskRow>(
      `SELECT * FROM procurement_task WHERE id = $1 FOR UPDATE`,
      [taskId]
    );
    return result.rows[0] ?? null;
  },

  async updateProcurementTask(
    client: PoolClient,
    taskId: string,
    data: { external_order_ref: string | null; actual_cost: string | null; platform: string | null; status: string }
  ): Promise<{ rowCount: number; task: ProcurementTaskRow | null }> {
    const result = await client.query<ProcurementTaskRow>(
      `UPDATE procurement_task
       SET external_order_ref = $2,
           actual_cost = $3::numeric,
           platform = $4,
           status = $5
       WHERE id = $1
         AND (
           external_order_ref IS DISTINCT FROM $2 OR
           actual_cost IS DISTINCT FROM $3::numeric OR
           platform IS DISTINCT FROM $4 OR
           status IS DISTINCT FROM $5
         )
       RETURNING *`,
      [taskId, data.external_order_ref, data.actual_cost, data.platform, data.status]
    );
    return {
      rowCount: result.rowCount ?? 0,
      task: result.rows[0] ?? null
    };
  },

  async findOrderItemByIdForUpdate(client: PoolClient, orderItemId: string): Promise<OrderItemRow | null> {
    const result = await client.query<OrderItemRow>(
      `SELECT * FROM order_item WHERE id = $1 FOR UPDATE`,
      [orderItemId]
    );
    return result.rows[0] ?? null;
  },

  async updateOrderItemStatus(
    client: PoolClient,
    orderItemId: string,
    status: string,
    refundAmount?: string
  ): Promise<{ rowCount: number; item: OrderItemRow | null }> {
    const query = refundAmount !== undefined
      ? `UPDATE order_item SET item_status = $2, refund_amount = $3::numeric WHERE id = $1 AND item_status <> $2 RETURNING *`
      : `UPDATE order_item SET item_status = $2 WHERE id = $1 AND item_status <> $2 RETURNING *`;
    const params = refundAmount !== undefined ? [orderItemId, status, refundAmount] : [orderItemId, status];
    const result = await client.query<OrderItemRow>(query, params);
    return {
      rowCount: result.rowCount ?? 0,
      item: result.rows[0] ?? null
    };
  },

  async insertRefund(
    client: PoolClient,
    data: { order_id: string; order_item_id: string | null; amount: string; reason: string; status: string; initiated_by: string | null; gateway_refund_id?: string | null }
  ): Promise<RefundRow> {
    const result = await client.query<RefundRow>(
      `INSERT INTO refund (order_id, order_item_id, amount, reason, status, initiated_by, gateway_refund_id)
       VALUES ($1, $2, $3::numeric, $4, $5::refund_status, $6, $7)
       RETURNING *`,
      [data.order_id, data.order_item_id, data.amount, data.reason, data.status, data.initiated_by, data.gateway_refund_id ?? null]
    );
    return result.rows[0];
  },

  async findRefunds(status?: string): Promise<RefundRow[]> {
    const query = status
      ? `SELECT * FROM refund WHERE status = $1::refund_status ORDER BY created_at ASC`
      : `SELECT * FROM refund ORDER BY created_at ASC`;
    const params = status ? [status] : [];
    const result = await pool.query<RefundRow>(query, params);
    return result.rows;
  },

  async findRefundByIdForUpdate(client: PoolClient, refundId: string): Promise<RefundRow | null> {
    const result = await client.query<RefundRow>(
      `SELECT * FROM refund WHERE id = $1 FOR UPDATE`,
      [refundId]
    );
    return result.rows[0] ?? null;
  },

  async findRefundByGatewayRefundIdForUpdate(client: PoolClient, gatewayRefundId: string): Promise<RefundRow | null> {
    const result = await client.query<RefundRow>(
      `SELECT * FROM refund WHERE gateway_refund_id = $1 FOR UPDATE`,
      [gatewayRefundId]
    );
    return result.rows[0] ?? null;
  },

  async updateRefundStatus(
    client: PoolClient,
    refundId: string,
    status: string,
    gatewayRefundId?: string | null
  ): Promise<{ rowCount: number; refund: RefundRow | null }> {
    const query = gatewayRefundId !== undefined
      ? `UPDATE refund SET status = $2::refund_status, gateway_refund_id = COALESCE(gateway_refund_id, $3), processed_at = CASE WHEN $2 IN ('processed', 'failed') THEN COALESCE(processed_at, now()) ELSE processed_at END WHERE id = $1 AND status <> $2::refund_status RETURNING *`
      : `UPDATE refund SET status = $2::refund_status, processed_at = CASE WHEN $2 IN ('processed', 'failed') THEN COALESCE(processed_at, now()) ELSE processed_at END WHERE id = $1 AND status <> $2::refund_status RETURNING *`;
    const params = gatewayRefundId !== undefined ? [refundId, status, gatewayRefundId] : [refundId, status];
    const result = await client.query<RefundRow>(query, params);
    return {
      rowCount: result.rowCount ?? 0,
      refund: result.rows[0] ?? null
    };
  }
};
