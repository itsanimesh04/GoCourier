import { Buffer } from 'node:buffer';
import { env } from '../../config/env';

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface CreateRazorpayOrderInput {
  amountSubunits: number;
  receipt: string;
  notes: Record<string, string>;
}

interface RazorpayRefundResponse {
  id: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
}

export interface CreateRazorpayRefundInput {
  paymentId: string;
  amountSubunits: number;
  notes?: Record<string, string>;
}

export const razorpayGatewayService = {
  async createOrder(data: CreateRazorpayOrderInput): Promise<RazorpayOrderResponse> {
    const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch(`${env.RAZORPAY_API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: data.amountSubunits,
        currency: 'INR',
        receipt: data.receipt,
        notes: data.notes
      })
    });

    const payload = (await response.json().catch(() => ({}))) as Partial<RazorpayOrderResponse> & {
      error?: { description?: string };
    };

    if (!response.ok || !payload.id) {
      throw new Error(payload.error?.description ?? 'Razorpay order creation failed');
    }

    return {
      id: payload.id,
      amount: payload.amount ?? data.amountSubunits,
      currency: payload.currency ?? 'INR',
      receipt: payload.receipt ?? data.receipt,
      status: payload.status ?? 'created'
    };
  },

  async createRefund(data: CreateRazorpayRefundInput): Promise<RazorpayRefundResponse> {
    const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch(`${env.RAZORPAY_API_BASE_URL}/payments/${data.paymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: data.amountSubunits,
        notes: data.notes
      })
    });

    const payload = (await response.json().catch(() => ({}))) as Partial<RazorpayRefundResponse> & {
      error?: { description?: string };
    };

    if (!response.ok || !payload.id) {
      throw new Error(payload.error?.description ?? 'Razorpay refund creation failed');
    }

    return {
      id: payload.id,
      amount: payload.amount ?? data.amountSubunits,
      currency: payload.currency ?? 'INR',
      payment_id: payload.payment_id ?? data.paymentId,
      status: payload.status ?? 'processed'
    };
  }
};

