import type { OrderStatus } from "@/types";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
  "refunded",
];

export const REVENUE_ORDER_STATUSES: readonly OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export const ADMIN_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  pending: ["cancelled"],
  paid: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  failed: [],
  refunded: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.includes(value as OrderStatus)
  );
}

export function canAdminTransitionOrder(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
) {
  return ADMIN_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function countsTowardRevenue(status: unknown) {
  return (
    isOrderStatus(status) &&
    REVENUE_ORDER_STATUSES.includes(status)
  );
}
