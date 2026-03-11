export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'gray',
  confirmed: 'blue',
  preparing: 'yellow',
  ready_for_pickup: 'orange',
  out_for_delivery: 'purple',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'red',
};
