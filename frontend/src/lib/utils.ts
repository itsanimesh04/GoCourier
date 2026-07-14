import type { OrderStatus, PaymentStatus } from './types';

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function formatINR(amount: number | string) {
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  return `₹${Math.round(numeric).toLocaleString('en-IN')}`;
}

export function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function countdownColor(secondsLeft: number, totalSeconds: number) {
  if (secondsLeft <= 0) {
    return 'var(--danger)';
  }

  const ratio = secondsLeft / Math.max(totalSeconds, 1);
  if (ratio > 0.45) {
    return 'var(--urgent)';
  }

  const urgentPercent = Math.round(Math.max(0, Math.min(100, ratio * 220)));
  return `color-mix(in srgb, var(--urgent) ${urgentPercent}%, var(--brand))`;
}

export function itemCountLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export function paymentLabel(status: PaymentStatus) {
  switch (status) {
    case 'success':
      return 'Paid';
    case 'partially_refunded':
      return 'Paid, partially refunded';
    case 'refunded':
      return 'Refunded';
    case 'failed':
      return 'Failed';
    case 'late':
      return 'Late payment';
    default:
      return 'Pending';
  }
}

export function getOrderStatusView(status: OrderStatus) {
  switch (status) {
    case 'cart':
      return {
        label: 'Order received',
        pill: 'Awaiting payment',
        activeStep: 0,
        completedSteps: 0,
        tone: 'neutral' as const,
        helper: 'We have your cart. Complete payment before the batch locks.'
      };
    case 'placed':
    case 'locked':
      return {
        label: 'Confirmed',
        pill: 'Order received',
        activeStep: 0,
        completedSteps: 1,
        tone: 'success' as const,
        helper: 'Your order is confirmed for this batch.'
      };
    case 'procuring':
    case 'confirmed':
      return {
        label: 'Preparing',
        pill: 'Being prepared',
        activeStep: 1,
        completedSteps: 1,
        tone: 'urgent' as const,
        helper: 'The restaurant is getting your food ready.'
      };
    case 'out_for_delivery':
      return {
        label: 'On the way',
        pill: 'On the way',
        activeStep: 2,
        completedSteps: 2,
        tone: 'urgent' as const,
        helper: 'Your rider is heading to the drop point.'
      };
    case 'delivered':
    case 'closed':
      return {
        label: 'Delivered',
        pill: 'Delivered',
        activeStep: 3,
        completedSteps: 4,
        tone: 'success' as const,
        helper: 'Delivered. Enjoy your food.'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        pill: 'Cancelled',
        activeStep: -1,
        completedSteps: 0,
        tone: 'danger' as const,
        helper: 'This order was cancelled.'
      };
    case 'refunded':
      return {
        label: 'Refunded',
        pill: 'Refunded',
        activeStep: -1,
        completedSteps: 0,
        tone: 'danger' as const,
        helper: 'This order was refunded to source.'
      };
    default:
      return {
        label: 'Order update',
        pill: 'Status update',
        activeStep: -1,
        completedSteps: 0,
        tone: 'neutral' as const,
        helper: 'We are checking the latest status for this order.'
      };
  }
}

export function isFocusedRoute(pathname: string) {
  return (
    pathname.startsWith('/auth') ||
    pathname === '/splash' ||
    pathname === '/onboarding' ||
    pathname === '/campus' ||
    pathname === '/checkout' ||
    pathname === '/payment/loading' ||
    pathname.includes('/confirmed') ||
    pathname.includes('/tracking') ||
    pathname.startsWith('/states')
  );
}
