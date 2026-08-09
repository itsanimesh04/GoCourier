export const ORDER_STATUSES = [
  "placed",
  "locked",
  "procuring",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "closed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type StatusBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function orderStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "delivered":
    case "closed":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "out_for_delivery":
    case "confirmed":
      return "default";
    default:
      return "outline";
  }
}

export function paymentStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case "success":
    case "paid":
      return "secondary";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
}
