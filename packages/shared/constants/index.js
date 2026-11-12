/**
 * Shared System & Domain Constants
 */

module.exports = {
  // Fraud Policy (SRS Section 7):
  // Exceeding 5 confirmed fake payment attempts places a red border on member profile
  FRAUD_RED_BORDER_THRESHOLD: 5,

  // Event Feed Policy (SRS Section 3.3):
  // Cancelled events remain visible in member Darshan feed for 24 hours, then disappear
  CANCELLED_EVENT_FEED_RETENTION_HOURS: 24,

  // Default Temple Image Fallbacks if no image uploaded
  DEFAULT_TEMPLE_IMAGES: [
    '/assets/defaults/temple-main.jpg'
  ],

  // Mobile Validation: 10 digit Indian standard
  MOBILE_REGEX: /^[6-9]\d{9}$/,

  // Standard Pagination Defaults
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20
};

