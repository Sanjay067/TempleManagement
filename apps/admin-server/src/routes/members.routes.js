const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, ErrorCode, PaymentStatus } = require('@temple/contracts');
const { Member, Contribution, FraudRecord } = require('@temple/database');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

// GET /api/v1/admin/members (SRS 9.5)
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    const contributions = await Contribution.find({ status: PaymentStatus.PAID });

    const formatted = members.map(m => {
      const memContrs = contributions.filter(c => String(c.memberId) === String(m._id));
      const totalContributed = memContrs.reduce((sum, c) => sum + Number(c.amount || 0), 0);
      return {
        _id: m._id,
        name: m.name,
        email: m.email,
        mobileNumber: m.mobileNumber,
        address: m.address,
        profilePhotoUrl: m.profilePhotoUrl,
        isActive: m.isActive,
        fakePaymentCount: m.fakePaymentCount || 0,
        hasRedBorder: m.hasRedBorder || false,
        totalContributed,
        contributionCount: memContrs.length,
        createdAt: m.createdAt
      };
    });

    return res.json(successResponse(formatted));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// GET /api/v1/admin/members/:id/fraud-history (SRS Section 7)
router.get('/:id/fraud-history', adminAuthMiddleware, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Member not found'));
    }

    const history = await FraudRecord.find({ memberId: member._id }).sort({ createdAt: -1 });
    return res.json(successResponse({
      member: {
        _id: member._id,
        name: member.name,
        fakePaymentCount: member.fakePaymentCount,
        hasRedBorder: member.hasRedBorder
      },
      history
    }));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PATCH /api/v1/admin/members/:id/red-border (SRS 7 & 9.5 manual override)
router.patch('/:id/red-border', adminAuthMiddleware, async (req, res) => {
  try {
    const { hasRedBorder } = req.body;
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Member not found'));
    }

    member.hasRedBorder = Boolean(hasRedBorder);
    await member.save();

    return res.json(successResponse(member, `Red border status updated to ${member.hasRedBorder}`));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = router;

