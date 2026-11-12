const { FRAUD_RED_BORDER_THRESHOLD } = require('../constants');

let contracts;
try {
  contracts = require('@temple/contracts');
} catch {
  contracts = require('../../contracts');
}
const { PaymentStatus } = contracts;

/**
 * Encapsulates fraud evaluation and red-border rules according to SRS Section 7.
 */
class FraudService {
  /**
   * Evaluates if a member has exceeded the fake payment limit and requires a red border.
   * Rule: Exceeding 5 confirmed fake payment attempts triggers red border.
   * @param {number} fakeCount 
   * @returns {boolean}
   */
  static shouldHaveRedBorder(fakeCount) {
    return fakeCount > FRAUD_RED_BORDER_THRESHOLD;
  }

  /**
   * Business helper to apply fraud penalty to a member record.
   * @param {Object} member - Member entity/document
   * @returns {{ fakePaymentCount: number, hasRedBorder: boolean }}
   */
  static applyFraudStrike(member) {
    const updatedCount = (member.fakePaymentCount || 0) + 1;
    const hasRedBorder = this.shouldHaveRedBorder(updatedCount) || Boolean(member.hasRedBorder);
    return {
      fakePaymentCount: updatedCount,
      hasRedBorder
    };
  }
}

module.exports = {
  FraudService
};
