declare module 'react-native-razorpay' {
  export type RazorpayOptions = {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name?: string;
    description?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    theme?: { color?: string };
  };

  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<{
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }>;
  };

  export default RazorpayCheckout;
}
