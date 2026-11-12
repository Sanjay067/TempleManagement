/**
 * Domain Enums for Temple Management System
 * Single Source of Truth - Do not redefine strings elsewhere!
 */

const PaymentStatus = Object.freeze({
  NOT_PAID: 'NOT_PAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  REJECTED: 'REJECTED'
});

const PaymentMode = Object.freeze({
  UPI: 'UPI',
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER'
});

const EventStatus = Object.freeze({
  UPCOMING: 'UPCOMING',
  PAST: 'PAST',
  CANCELLED: 'CANCELLED'
});

const TargetAudience = Object.freeze({
  ALL: 'ALL',
  PAID: 'PAID',
  UNPAID: 'UNPAID',
  INDIVIDUAL: 'INDIVIDUAL'
});

const ErrorCode = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  FRAUD_FLAGGED: 'FRAUD_FLAGGED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
});

module.exports = {
  PaymentStatus,
  PaymentMode,
  EventStatus,
  TargetAudience,
  ErrorCode
};

