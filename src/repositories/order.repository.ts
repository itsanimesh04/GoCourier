import type { PoolClient } from 'pg';
import { pool } from '../db/pool';
import { withTransaction as withTx } from '../db/transaction';

export type OrderStatus =
  | 'cart'
  | 'placed'
  | 'locked'
  | 'procuring'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'closed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'late' | 'refunded' | 'partially_refunded';

export interface OrderRow {
  id: string;
  student_id: string;
  campus_id: string;
  restaurant_id: string;
  batch_id: string | null;
  drop_point: string | null;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  fee: string;
  total_amount: string;
  placed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItemInsert {
  menu_item_id: string;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
}

export interface CartHeaderRow extends OrderRow {
  campus_name: string;
  campus_city: string;
  cutoff_time: string;
  delivery_time: string;
  restaurant_name: string;
}

export interface OrderWithCutoffRow extends OrderRow {
  cutoff_time: string;
}

export interface OrderTransitionResult {
  rowCount: number;
  order: OrderRow | null;
}

export interface CartItemDetailRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name_snap: string;
  price_snapshot: string;
  quantity: number;
  item_status: 'pending' | 'confirmed' | 'unavailable' | 'refunded';
  refund_amount: string | null;
  menu_item_name: string;
  is_veg: boolean | null;
  is_available: boolean;
}

async function queryOpenCartForStudent(
  client: PoolClient,
  studentId: string,
  lockForUpdate: boolean
): Promise<OrderRow | null> {
  const result = await client.query<OrderRow>(
    `SELECT *
     FROM "order"
     WHERE student_id = $1
       AND order_status = 'cart'
       AND payment_status = 'pending'
     ORDER BY created_at DESC
     LIMIT 1
     ${lockForUpdate ? 'FOR UPDATE' : ''}`,
    [studentId]
  );
  return result.rows[0] ?? null;
}

export const orderRepository = {
  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    return withTx(callback);
  },

  findOpenCartForStudentForUpdate(client: PoolClient, studentId: string): Promise<OrderRow | null> {
    return queryOpenCartForStudent(client, studentId, true);
  },

  async findAwaitingPaymentForStudent(orderId: string, studentId: string): Promise<OrderWithCutoffRow | null> {
    const result = await pool.query<OrderWithCutoffRow>(
      `SELECT o.*, c.cutoff_time
       FROM "order" o
       JOIN campus c ON c.id = o.campus_id
       WHERE o.id = $1
         AND o.student_id = $2
       LIMIT 1`,
      [orderId, studentId]
    );
    return result.rows[0] ?? null;
  },

  async findAwaitingPaymentForStudentForUpdate(
    client: PoolClient,
    orderId: string,
    studentId: string
  ): Promise<OrderWithCutoffRow | null> {
    const result = await client.query<OrderWithCutoffRow>(
      `SELECT o.*, c.cutoff_time
       FROM "order" o
       JOIN campus c ON c.id = o.campus_id
       WHERE o.id = $1
         AND o.student_id = $2
       LIMIT 1
       FOR UPDATE OF o`,
      [orderId, studentId]
    );
    return result.rows[0] ?? null;
  },

  /**
   * Non-locking re-read of an order + campus cutoff_time, for use inside an
   * already-open transaction when you hold a lock on the row through another
   * path and just need a fresh snapshot. Do NOT use this for branching logic
   * where another transaction could modify the row concurrently — use
   * findByIdWithCutoffForUpdate instead.
   */
  async findByIdWithCutoffUnlocked(client: PoolClient, orderId: string): Promise<OrderWithCutoffRow | null> {
    const result = await client.query<OrderWithCutoffRow>(
      `SELECT o.*, c.cutoff_time
       FROM "order" o
       JOIN campus c ON c.id = o.campus_id
       WHERE o.id = $1
       LIMIT 1`,
      [orderId]
    );
    return result.rows[0] ?? null;
  },

  async findByIdWithCutoffForUpdate(client: PoolClient, orderId: string): Promise<OrderWithCutoffRow | null> {
    const result = await client.query<OrderWithCutoffRow>(
      `SELECT o.*, c.cutoff_time
       FROM "order" o
       JOIN campus c ON c.id = o.campus_id
       WHERE o.id = $1
       LIMIT 1
       FOR UPDATE OF o`,
      [orderId]
    );
    return result.rows[0] ?? null;
  },

  async countItemsForOrder(orderId: string): Promise<number> {
    const result = await pool.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM order_item WHERE order_id = $1',
      [orderId]
    );
    return result.rows[0]?.count ?? 0;
  },

  async findOpenCartForStudent(studentId: string): Promise<OrderRow | null> {
    const client = await pool.connect();
    try {
      return queryOpenCartForStudent(client, studentId, false);
    } finally {
      client.release();
    }
  },

  async createCart(
    client: PoolClient,
    data: {
      student_id: string;
      campus_id: string;
      restaurant_id: string;
      subtotal: string;
      fee: string;
      total_amount: string;
    }
  ): Promise<OrderRow> {
    const result = await client.query<OrderRow>(
      `INSERT INTO "order" (student_id, campus_id, restaurant_id, drop_point, subtotal, fee, total_amount)
       VALUES ($1, $2, $3, NULL, $4, $5, $6)
       RETURNING *`,
      [data.student_id, data.campus_id, data.restaurant_id, data.subtotal, data.fee, data.total_amount]
    );
    return result.rows[0];
  },

  async updateCartTotals(
    client: PoolClient,
    orderId: string,
    data: { subtotal: string; fee: string; total_amount: string }
  ): Promise<OrderRow> {
    const result = await client.query<OrderRow>(
      `UPDATE "order"
       SET drop_point = NULL,
           subtotal = $2,
           fee = $3,
           total_amount = $4,
           updated_at = now()
       WHERE id = $1
         AND order_status = 'cart'
       RETURNING *`,
      [orderId, data.subtotal, data.fee, data.total_amount]
    );
    return result.rows[0];
  },

  async replaceCartItems(client: PoolClient, orderId: string, items: OrderItemInsert[]): Promise<void> {
    await client.query('DELETE FROM order_item WHERE order_id = $1', [orderId]);

    for (const item of items) {
      await client.query(
        `INSERT INTO order_item (order_id, menu_item_id, item_name_snap, price_snapshot, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.menu_item_id, item.item_name_snap, item.price_snapshot, item.quantity]
      );
    }
  },

  async countItems(client: PoolClient, orderId: string): Promise<number> {
    const result = await client.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM order_item WHERE order_id = $1',
      [orderId]
    );
    return result.rows[0]?.count ?? 0;
  },

  async getCartHeader(studentId: string): Promise<CartHeaderRow | null> {
    const result = await pool.query<CartHeaderRow>(
      `SELECT o.*,
              c.name AS campus_name,
              c.city AS campus_city,
              c.cutoff_time,
              c.delivery_time,
              r.name AS restaurant_name
       FROM "order" o
       JOIN campus c ON c.id = o.campus_id
       JOIN restaurant r ON r.id = o.restaurant_id
       WHERE o.student_id = $1
         AND o.order_status = 'cart'
         AND o.payment_status = 'pending'
       ORDER BY o.created_at DESC
       LIMIT 1`,
      [studentId]
    );
    return result.rows[0] ?? null;
  },

  async getCartItems(orderId: string): Promise<CartItemDetailRow[]> {
    const result = await pool.query<CartItemDetailRow>(
      `SELECT oi.*,
              mi.name AS menu_item_name,
              mi.is_veg,
              mi.is_available
       FROM order_item oi
       JOIN menu_item mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1
       ORDER BY lower(oi.item_name_snap) ASC`,
      [orderId]
    );
    return result.rows;
  },

  async setDropPoint(client: PoolClient, orderId: string, dropPoint: string): Promise<OrderRow> {
    const result = await client.query<OrderRow>(
      `UPDATE "order"
       SET drop_point = $2,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [orderId, dropPoint]
    );
    return result.rows[0];
  },

  async markPaymentSuccess(client: PoolClient, orderId: string): Promise<OrderTransitionResult> {
    const result = await client.query<OrderRow>(
      `UPDATE "order"
       SET order_status = 'placed',
           payment_status = 'success',
           placed_at = now(),
           updated_at = now()
       WHERE id = $1
         AND order_status = 'cart'
         AND payment_status = 'pending'
       RETURNING *`,
      [orderId]
    );
    return {
      rowCount: result.rowCount ?? 0,
      order: result.rows[0] ?? null
    };
  },

  async markPaymentLate(client: PoolClient, orderId: string): Promise<OrderTransitionResult> {
    const result = await client.query<OrderRow>(
      `UPDATE "order"
       SET payment_status = 'late',
           updated_at = now()
       WHERE id = $1
         AND order_status = 'cart'
         AND payment_status = 'pending'
       RETURNING *`,
      [orderId]
    );
    return {
      rowCount: result.rowCount ?? 0,
      order: result.rows[0] ?? null
    };
  },

  async insertFullOrderRefund(
    client: PoolClient,
    data: { order_id: string; amount: string; reason: string; initiated_by: string | null }
  ): Promise<void> {
    await client.query(
      `INSERT INTO refund (order_id, order_item_id, amount, reason, status, initiated_by)
       VALUES ($1, NULL, $2, $3, 'pending', $4)`,
      [data.order_id, data.amount, data.reason, data.initiated_by]
    );
  },

  async insertAudit(
    client: PoolClient,
    data: { order_id: string | null; actor_id: string | null; action: string; details?: unknown }
  ): Promise<void> {
    await client.query(
      `INSERT INTO audit_log (order_id, actor_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [data.order_id, data.actor_id, data.action, JSON.stringify(data.details ?? {})]
    );
  }
};
