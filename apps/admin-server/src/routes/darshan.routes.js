const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, ErrorCode } = require('@temple/contracts');
const { DarshanSettings } = require('@temple/database');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

// GET /api/v1/admin/darshan-settings
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    let settings = await DarshanSettings.findOne();
    if (!settings) {
      settings = {
        dailyKaryakrams: [
          { time: '05:30 AM', title: 'Suprabhata Seva', details: 'Awakening of deities' },
          { time: '06:30 AM', title: 'Vishwaroopa Darshan', details: 'First morning darshan' },
          { time: '08:00 AM', title: 'Kala Sandhi Pooja & Abhishekam', details: 'Ceremonial bath' },
          { time: '11:30 AM', title: 'Uchikala Pooja & Maha Naivedyam', details: 'Midday archana' },
          { time: '05:00 PM', title: 'Sayarakshai Pooja', details: 'Twilight deeparadhana' },
          { time: '08:30 PM', title: 'Ardhajama Pooja', details: 'Night prayers and closing' }
        ],
        poojaTimings: 'Morning: 6:00 AM - 12:30 PM | Evening: 4:30 PM - 9:00 PM',
        openingHours: '05:00 AM',
        closingHours: '09:15 PM',
        generalInfo: 'Traditional attire mandatory. Special queues for elders.'
      };
    }
    return res.json(successResponse(settings));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PUT /api/v1/admin/darshan-settings
router.put('/', adminAuthMiddleware, async (req, res) => {
  try {
    let settings = await DarshanSettings.findOne();
    if (!settings) {
      settings = new DarshanSettings(req.body);
    } else {
      if (req.body.dailyKaryakrams) settings.dailyKaryakrams = req.body.dailyKaryakrams;
      if (req.body.poojaTimings) settings.poojaTimings = req.body.poojaTimings;
      if (req.body.openingHours) settings.openingHours = req.body.openingHours;
      if (req.body.closingHours) settings.closingHours = req.body.closingHours;
      if (req.body.generalInfo !== undefined) settings.generalInfo = req.body.generalInfo;
    }
    settings.updatedByAdminId = req.admin._id;
    const saved = await settings.save();
    return res.json(successResponse(saved, 'Darshan schedule updated successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = router;

