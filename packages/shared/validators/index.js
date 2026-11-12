const { MOBILE_REGEX } = require('../constants');

let contracts;
try {
  contracts = require('@temple/contracts');
} catch {
  contracts = require('../../contracts');
}
const { PaymentMode, TargetAudience } = require('../../contracts');

function validateRegistration(data) {
  const errors = [];
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required.');
  }
  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email address is required.');
  }
  if (!data.mobileNumber || !MOBILE_REGEX.test(data.mobileNumber)) {
    errors.push('Valid 10-digit mobile number is required.');
  }
  if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
    errors.push('Address is required.');
  }
  if (!data.password || typeof data.password !== 'string' || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  return { isValid: errors.length === 0, errors };
}

function validateContributionSubmission(data) {
  const errors = [];
  if (!data.eventId) {
    errors.push('Event ID is required.');
  }
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Contribution amount must be a positive number.');
  }
  if (!data.paymentProofUrl || typeof data.paymentProofUrl !== 'string') {
    errors.push('Payment proof screenshot is mandatory.');
  }
  return { isValid: errors.length === 0, errors };
}

function validateOfflineContribution(data) {
  const errors = [];
  if (!data.memberId) {
    errors.push('Member ID is required.');
  }
  if (!data.eventId) {
    errors.push('Event ID is required.');
  }
  const amount = Number(data.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push('Valid amount is required.');
  }
  if (!data.paymentMode || !Object.values(PaymentMode).includes(data.paymentMode)) {
    errors.push(`Invalid payment mode. Must be one of: ${Object.values(PaymentMode).join(', ')}`);
  }
  return { isValid: errors.length === 0, errors };
}

function validateEvent(data) {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Event title is required.');
  }
  if (!data.eventDateTime || isNaN(new Date(data.eventDateTime).getTime())) {
    errors.push('Valid event date and time is required.');
  }
  if (!data.expiryTime || isNaN(new Date(data.expiryTime).getTime())) {
    errors.push('Valid expiry date and time is required.');
  }
  return { isValid: errors.length === 0, errors };
}

function validateNotification(data) {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Notification title is required.');
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Notification message is required.');
  }
  if (!data.targetAudience || !Object.values(TargetAudience).includes(data.targetAudience)) {
    errors.push(`Invalid target audience. Must be one of: ${Object.values(TargetAudience).join(', ')}`);
  }
  if (!data.expiryDate || isNaN(new Date(data.expiryDate).getTime())) {
    errors.push('Valid expiry date is required.');
  }
  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateRegistration,
  validateContributionSubmission,
  validateOfflineContribution,
  validateEvent,
  validateNotification
};
