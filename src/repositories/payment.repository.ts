import type { PoolClient } from 'pg';
import { pool } from '../db/pool';

export interface PaymentRow {
  id: string;
  order_id: string;
  gateway: string;
  gateway_order_id: string | null;
  gateway_txn_id: string | null;
  amount: string;
  status: string;
  webhook_payload: unknown;
  created_at: Date;
}

export const paymentRepository = {
  async findPendingRazorpaySessionForOrder(orderId: string): Promise<PaymentRow | null> {
    const result = await pool.query<PaymentRow>(
      `SELECT *
       FROM payment
       WHERE order_id = $1
         AND gateway = 'razorpay'
         AND gateway_order_id IS NOT NULL
         AND gateway_txn_id IS NULL
         AND status = 'created'
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId]
    );
    return result.rows[0] ?? null;
  },

  async findPendingRazorpaySessionForOrderForUpdate(
    client: PoolClient,
    orderId: string
  ): Promise<PaymentRow | null> {
    const result = await client.query<PaymentRow>(
      `SELECT *
       FROM payment
       WHERE order_id = $1
         AND gateway = 'razorpay'
         AND gateway_order_id IS NOT NULL
         AND gateway_txn_id IS NULL
         AND status = 'created'
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [orderId]
    );
    return result.rows[0] ?? null;
  },

  async createRazorpaySessionIfAbsent(
    client: PoolClient,
    data: { order_id: string; gateway_order_id: string; amount: string }
  ): Promise<PaymentRow | null> {
    const result = await client.query<PaymentRow>(
      `INSERT INTO payment (order_id, gateway, gateway_order_id, amount, status)
       VALUES ($1, 'razorpay', $2, $3, 'created')
       ON CONFLICT (order_id)
       WHERE gateway = 'razorpay'
         AND gateway_order_id IS NOT NULL
         AND gateway_txn_id IS NULL
         AND status = 'created'
       DO NOTHING
       RETURNING *`,
      [data.order_id, data.gateway_order_id, data.amount]
    );
    return result.rows[0] ?? null;
  },


  async findRazorpayTxnForUpdate(client: PoolClient, gatewayTxnId: string): Promise<PaymentRow | null> {
    const result = await client.query<PaymentRow>(
      `SELECT *
       FROM payment
       WHERE gateway = 'razorpay'
         AND gateway_txn_id = $1
       LIMIT 1
       FOR UPDATE`,
      [gatewayTxnId]
    );
    return result.rows[0] ?? null;
  },

  async findRazorpaySessionByGatewayOrderIdForUpdate(
    client: PoolClient,
    gatewayOrderId: string
  ): Promise<PaymentRow | null> {
    const result = await client.query<PaymentRow>(
      `SELECT *
       FROM payment
       WHERE gateway = 'razorpay'
         AND gateway_order_id = $1
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [gatewayOrderId]
    );
    return result.rows[0] ?? null;
  },

  async markRazorpayPaymentCaptured(
    client: PoolClient,
    paymentId: string,
    data: { gateway_txn_id: string; webhook_payload: unknown }
  ): Promise<PaymentRow> {
    const result = await client.query<PaymentRow>(
      `UPDATE payment
       SET gateway_txn_id = $2,
           status = 'captured',
           webhook_payload = $3::jsonb
       WHERE id = $1
       RETURNING *`,
      [paymentId, data.gateway_txn_id, JSON.stringify(data.webhook_payload)]
    );
    return result.rows[0];
  },

  async findCapturedPaymentForOrder(client: PoolClient, orderId: string): Promise<PaymentRow | null> {
    const result = await client.query<PaymentRow>(
      `SELECT *
       FROM payment
       WHERE order_id = $1
         AND status = 'captured'
       ORDER BY created_at DESC
       LIMIT 1`,
      [orderId]
    );
    return result.rows[0] ?? null;
  }
};

