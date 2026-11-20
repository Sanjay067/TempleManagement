/**
 * Domain Enums matching @temple/contracts
 */

export const PaymentStatus = Object.freeze({
  NOT_PAID: 'NOT_PAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  REJECTED: 'REJECTED'
});

export const PaymentMode = Object.freeze({
  UPI: 'UPI',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER'
});

export const EventStatus = Object.freeze({
  UPCOMING: 'UPCOMING',
  PAST: 'PAST',
  CANCELLED: 'CANCELLED'
});

export const TargetAudience = Object.freeze({
  ALL: 'ALL',
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  INDIVIDUAL: 'INDIVIDUAL'
});

export const ErrorCode = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FRAUD_FLAGGED: 'FRAUD_FLAGGED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
});

export const FRAUD_RED_BORDER_THRESHOLD = 5;

