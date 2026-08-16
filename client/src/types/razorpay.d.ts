declare interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare class Razorpay {
  constructor(options: {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name?: string;
    description?: string;
    handler: (response: RazorpaySuccessResponse) => void;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
  });
  open(): void;
}

interface Window {
  Razorpay: typeof Razorpay;
}
