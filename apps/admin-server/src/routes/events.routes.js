const express = require('express');
const router = express.Router();
const { successResponse, errorResponse, ErrorCode, EventStatus } = require('@temple/contracts');
const { Event } = require('@temple/database');
const { validateEvent } = require('@temple/shared');
const { adminAuthMiddleware } = require('../middlewares/auth.middleware');

// GET /api/v1/admin/events
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ eventDateTime: -1 });
    return res.json(successResponse(events));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// POST /api/v1/admin/events
router.post('/', adminAuthMiddleware, async (req, res) => {
  try {
    const { isValid, errors } = validateEvent(req.body);
    if (!isValid) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Event validation failed', errors));
    }

    const newEvent = new Event({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      eventDateTime: new Date(req.body.eventDateTime),
      expiryTime: new Date(req.body.expiryTime),
      images: Array.isArray(req.body.images) ? req.body.images : [],
      isContributionRequired: Boolean(req.body.isContributionRequired),
      status: EventStatus.UPCOMING
    });

    const saved = await newEvent.save();
    return res.status(201).json(successResponse(saved, 'Event created successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PUT /api/v1/admin/events/:id
router.put('/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Event not found'));
    }

    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    if (req.body.eventDateTime) event.eventDateTime = new Date(req.body.eventDateTime);
    if (req.body.expiryTime) event.expiryTime = new Date(req.body.expiryTime);
    if (req.body.images) event.images = req.body.images;
    if (req.body.isContributionRequired !== undefined) {
      event.isContributionRequired = req.body.isContributionRequired;
    }

    const updated = await event.save();
    return res.json(successResponse(updated, 'Event updated successfully'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

// PATCH /api/v1/admin/events/:id/cancel (SRS 3.3)
router.patch('/:id/cancel', adminAuthMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, 'Event not found'));
    }

    event.status = EventStatus.CANCELLED;
    event.cancelledAt = new Date();
    await event.save();

    return res.json(successResponse(event, 'Event cancelled. Contributions and audit trails preserved.'));
  } catch (error) {
    return res.status(500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, error.message));
  }
});

module.exports = router;

