/**
 * Centralized Order Status Constants
 */
const ORDER_STATUS = {
  PLACED: "Order Placed",
  PENDING: "Pending",
  SCHEDULED: "Scheduled",
  ACCEPTED: "Accepted",
  PROCESSING: "Processing",
  ON_THE_WAY: "Order On The Way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  FAILED: "Payment Failed",
};

/**
 * Valid Status Transitions
 * Defines what status can follow another to prevent invalid flows.
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PLACED]: [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.SCHEDULED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SCHEDULED]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ON_THE_WAY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.FAILED]: [ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED],
};

/**
 * Shiprocket Status Mapping to Internal Status
 */
const MAP_SHIPROCKET_STATUS = (shiprocketStatus) => {
  const status = String(shiprocketStatus).toLowerCase();

  const mapping = {
    // Scheduled
    "ready to ship": ORDER_STATUS.SCHEDULED,
    "manifested": ORDER_STATUS.SCHEDULED,
    
    // Processing
    "shipped": ORDER_STATUS.PROCESSING,
    "picked up": ORDER_STATUS.PROCESSING,
    "in transit": ORDER_STATUS.PROCESSING,
    "reached at hub": ORDER_STATUS.PROCESSING,
    
    // Order On The Way
    "out for delivery": ORDER_STATUS.ON_THE_WAY,
    
    // Delivered
    "delivered": ORDER_STATUS.DELIVERED,
    
    // Cancelled
    "cancelled": ORDER_STATUS.CANCELLED,
    "canceled": ORDER_STATUS.CANCELLED,
    "rto initiated": ORDER_STATUS.CANCELLED,
    "rto delivered": ORDER_STATUS.CANCELLED,
    
    // Failed
    "delivery failed": ORDER_STATUS.ON_THE_WAY, // Or keep as is, but user wanted specific mappings
  };

  return mapping[status] || null;
};

module.exports = {
  ORDER_STATUS,
  VALID_TRANSITIONS,
  MAP_SHIPROCKET_STATUS,
};
