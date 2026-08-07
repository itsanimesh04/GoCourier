import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from '../../components/ui';
import { useAppState } from '../../state/AppState';

export function PaymentLoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmPayment } = useAppState();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId') ?? undefined;

  useEffect(() => {
    if (location.search.includes('hold=1')) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      void confirmPayment(orderId).finally(() => {
        navigate(`/orders/${orderId ?? 'order-demo'}/confirmed`);
      });
    }, 1600);
    return () => window.clearTimeout(id);
  }, [confirmPayment, location.search, navigate, orderId]);

  return (
    <div className="flex min-h-[calc(100vh-40px)] flex-col items-center justify-center text-center">
      <div className="relative h-28 w-28">
        <div className="animate-spinner absolute inset-0 rounded-full border-[10px] border-brand border-r-urgent border-t-transparent" />
        <span className="absolute right-4 top-14 h-2 w-2 rounded-full bg-brand" />
      </div>
      <h1 className="mt-10 font-display text-[31px] font-bold leading-tight">Cooking up your payment...</h1>
      <p className="mt-3 text-sm text-muted">Hang tight, don't close this screen</p>
      <p className="mt-auto flex min-h-tap items-center gap-2 pb-6 text-sm text-muted">
        <Lock size={16} /> Secure payment
      </p>
    </div>
  );
}
