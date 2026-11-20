const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, ErrorCode, PaymentStatus } = require('@temple/contracts');
const { Contribution, Member, Event, FraudRecord } = require('@temple/database');
const { FraudService, validateOfflineContribution } = require('@temple/shared');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

// GET /api/v1/admin/contributions
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { status, eventId } = req.query;
    const filter = {};
    if (status && status !== 'ALL') filter.status = status;
    if (eventId && eventId !== 'ALL') filter.eventId = eventId;

    const list = await Contribution.find(filter)
      .populate('memberId', 'name email mobileNumber hasRedBorder fakePaymentCount')
      .populate('eventId', 'title status')
      .sort({ createdAt: -1 });

    const formatted = list.map(c => ({
      _id: c._id,
      memberId: c.memberId?._id,
      member: c.memberId || { name: 'Former Member', mobileNumber: 'N/A' },
      eventId: c.eventId?._id,
      event: c.eventId || { title: 'Archived Event' },
      amount: c.amount,
      paymentMode: c.paymentMode,
      paymentProofUrl: c.paymentProofUrl,
      status: c.status,
      isOffline: c.isOffline,
      rejectionReason: c.rejectionReason,
      isFraudulent: c.isFraudulent,
      createdAt: c.createdAt
    }));

    return res.json(successResponse(formatted));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PATCH /api/v1/admin/contributions/:id/verify
router.patch('/:id/verify', adminAuthMiddleware, async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Contribution not found'));
    }

    if (action === 'APPROVE') {
      contribution.status = PaymentStatus.PAID;
      contribution.verifiedAt = new Date();
      contribution.verifiedByAdminId = req.admin._id;
      contribution.rejectionReason = null;
    } else if (action === 'REJECT') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Rejection reason is required.'));
      }
      contribution.status = PaymentStatus.REJECTED;
      contribution.verifiedAt = new Date();
      contribution.verifiedByAdminId = req.admin._id;
      contribution.rejectionReason = rejectionReason.trim();
    } else {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Action must be APPROVE or REJECT.'));
    }

    await contribution.save();
    return res.json(successResponse(contribution, `Contribution marked as ${contribution.status}`));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// POST /api/v1/admin/contributions/:id/flag-fraud (SRS Section 7)
router.post('/:id/flag-fraud', adminAuthMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Reason is required when flagging fraud.'));
    }

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Contribution not found'));
    }

    const member = await Member.findById(contribution.memberId);
    if (!member) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Member not found'));
    }

    // Mark contribution as rejected & fraudulent
    contribution.status = PaymentStatus.REJECTED;
    contribution.isFraudulent = true;
    contribution.rejectionReason = `[FRAUD FLAGGED]: ${reason.trim()}`;
    contribution.verifiedAt = new Date();
    contribution.verifiedByAdminId = req.admin._id;
    await contribution.save();

    // Use domain calculation service from @temple/shared
    const { fakePaymentCount, hasRedBorder } = FraudService.applyFraudStrike(member);
    member.fakePaymentCount = fakePaymentCount;
    member.hasRedBorder = hasRedBorder;
    await member.save();

    // Log permanent audit record
    const fraudRecord = new FraudRecord({
      memberId: member._id,
      contributionId: contribution._id,
      flaggedByAdminId: req.admin._id,
      reason: reason.trim()
    });
    await fraudRecord.save();

    return res.json(successResponse({
      contribution,
      member: {
        _id: member._id,
        name: member.name,
        fakePaymentCount: member.fakePaymentCount,
        hasRedBorder: member.hasRedBorder
      },
      fraudRecord
    }, 'Fraud recorded and penalty strike updated.'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// POST /api/v1/admin/contributions/offline (SRS 6.4)
router.post('/offline', adminAuthMiddleware, async (req, res) => {
  try {
    const { isValid, errors } = validateOfflineContribution(req.body);
    if (!isValid) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Offline entry validation failed', errors));
    }

    const newContribution = new Contribution({
      memberId: req.body.memberId,
      eventId: req.body.eventId,
      amount: Number(req.body.amount),
      paymentMode: req.body.paymentMode,
      paymentProofUrl: null,
      status: req.body.status || PaymentStatus.PAID,
      isOffline: true,
      recordedByAdminId: req.admin._id,
      verifiedAt: req.body.status === PaymentStatus.PAID ? new Date() : null,
      verifiedByAdminId: req.body.status === PaymentStatus.PAID ? req.admin._id : null
    });

    const saved = await newContribution.save();
    return res.status(201).json(successResponse(saved, 'Offline contribution recorded successfully.'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// GET /api/v1/admin/contributions/reports (SRS 9.4)
router.get('/reports', adminAuthMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDateTime: -1 });
    const contributions = await Contribution.find()
      .populate('memberId', 'name mobileNumber')
      .lean();

    const reports = events.map(evt => {
      const evContrs = contributions.filter(c => String(c.eventId) === String(evt._id));
      const paidContrs = evContrs.filter(c => c.status === PaymentStatus.PAID);
      const totalAmount = paidContrs.reduce((sum, c) => sum + Number(c.amount || 0), 0);
      const uniqueDonors = new Set(paidContrs.map(c => String(c.memberId?._id || c.memberId))).size;

      const records = evContrs.map(c => ({
        id: c._id,
        memberName: c.memberId?.name || 'Former Devotee',
        mobileNumber: c.memberId?.mobileNumber || 'N/A',
        amount: c.amount,
        paymentMode: c.paymentMode,
        status: c.status,
        isOffline: c.isOffline,
        date: c.createdAt
      }));

      return {
        eventId: evt._id,
        eventName: evt.title,
        eventStatus: evt.status,
        eventDateTime: evt.eventDateTime,
        numberOfContributors: uniqueDonors,
        totalAmountCollected: totalAmount,
        records
      };
    });

    return res.json(successResponse(reports));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = router;

