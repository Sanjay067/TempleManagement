const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, ErrorCode } = require('@temple/contracts');
const { Notification } = require('@temple/database');
const { validateNotification } = require('@temple/shared');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

// GET /api/v1/admin/notifications
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    return res.json(successResponse(list));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// POST /api/v1/admin/notifications
router.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { isValid, errors } = validateNotification(req.body);
    if (!isValid) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Notification validation failed', errors));
    }

    const notif = new Notification({
      title: req.body.title.trim(),
      message: req.body.message.trim(),
      targetAudience: req.body.targetAudience,
      targetMemberIds: req.body.targetMemberIds || [],
      expiryDate: new Date(req.body.expiryDate),
      createdByAdminId: req.admin._id
    });

    const saved = await notif.save();
    return res.status(201).json(successResponse(saved, 'Notification broadcasted successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PUT /api/v1/admin/notifications/:id
router.put('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Notification not found'));
    }

    if (req.body.title) notif.title = req.body.title.trim();
    if (req.body.message) notif.message = req.body.message.trim();
    if (req.body.targetAudience) notif.targetAudience = req.body.targetAudience;
    if (req.body.targetMemberIds) notif.targetMemberIds = req.body.targetMemberIds;
    if (req.body.expiryDate) notif.expiryDate = new Date(req.body.expiryDate);

    const updated = await notif.save();
    return res.json(successResponse(updated, 'Notification updated successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// DELETE /api/v1/admin/notifications/:id
router.delete('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Notification not found'));
    }
    return res.json(successResponse({ id: req.params.id }, 'Notification deleted successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = router;

