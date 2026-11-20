import {
  initialAdmin,
  initialMembers,
  initialEvents,
  initialContributions,
  initialFraudRecords,
  initialNotifications,
  initialDarshanSettings
} from './mockData';
import { PaymentStatus, EventStatus, FRAUD_RED_BORDER_THRESHOLD } from '../contracts';

const STORAGE_KEYS = {
  ADMIN: 'temple_admin_user',
  TOKEN: 'temple_admin_token',
  MEMBERS: 'temple_members_v1',
  EVENTS: 'temple_events_v1',
  CONTRIBUTIONS: 'temple_contributions_v1',
  FRAUD_RECORDS: 'temple_fraud_records_v1',
  NOTIFICATIONS: 'temple_notifications_v1',
  DARSHAN: 'temple_darshan_v1',
  USE_LIVE_API: 'temple_use_live_api'
};

// Seed local storage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initialEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS)) {
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(initialContributions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FRAUD_RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.FRAUD_RECORDS, JSON.stringify(initialFraudRecords));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DARSHAN)) {
    localStorage.setItem(STORAGE_KEYS.DARSHAN, JSON.stringify(initialDarshanSettings));
  }
}

initializeStorage();

// Storage helper functions
const getStored = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // Reset all to sample temple seed data
  resetDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(initialMembers));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initialEvents));
    localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(initialContributions));
    localStorage.setItem(STORAGE_KEYS.FRAUD_RECORDS, JSON.stringify(initialFraudRecords));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(STORAGE_KEYS.DARSHAN, JSON.stringify(initialDarshanSettings));
  },

  // Auth
  login: async (email, password) => {
    // V1 supports one admin account: admin@temple.org
    if (email.toLowerCase().trim() === 'admin@temple.org' && (password === 'admin123' || password === 'AdminPassword123!')) {
      const token = 'temple_jwt_admin_session_valid';
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(initialAdmin));
      return { success: true, data: { user: initialAdmin, token } };
    }
    throw new Error('Invalid email or password. Use: admin@temple.org / admin123');
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ADMIN);
    return { success: true };
  },

  getAdminUser: () => {
    return getStored(STORAGE_KEYS.ADMIN, null);
  },

  // Dashboard Overview Stats (SRS 9.1)
  getDashboardStats: async () => {
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const events = getStored(STORAGE_KEYS.EVENTS);

    const activeMembers = members.filter(m => m.isActive);
    const totalCollected = contributions
      .filter(c => c.status === PaymentStatus.PAID)
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);
    const pendingCount = contributions.filter(c => c.status === PaymentStatus.PENDING).length;
    const upcomingEvents = events.filter(e => e.status === EventStatus.UPCOMING);

    return {
      success: true,
      data: {
        totalRegisteredMembers: activeMembers.length,
        totalContributionsCollected: totalCollected,
        pendingVerificationsCount: pendingCount,
        upcomingEventsCount: upcomingEvents.length,
        upcomingEvents: upcomingEvents.slice(0, 3)
      }
    };
  },

  // Events (SRS 9.2, 3.1-3.4)
  getEvents: async () => {
    const events = getStored(STORAGE_KEYS.EVENTS);
    const now = new Date();
    // Auto-update expired events to PAST if status was UPCOMING
    let modified = false;
    const updatedEvents = events.map(evt => {
      if (evt.status === EventStatus.UPCOMING && new Date(evt.expiryTime) < now) {
        modified = true;
        return { ...evt, status: EventStatus.PAST };
      }
      return evt;
    });
    if (modified) {
      setStored(STORAGE_KEYS.EVENTS, updatedEvents);
    }
    return { success: true, data: updatedEvents };
  },

  createEvent: async (eventData) => {
    const events = getStored(STORAGE_KEYS.EVENTS);
    const newEvent = {
      _id: 'evt_' + Date.now(),
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      eventDateTime: new Date(eventData.eventDateTime).toISOString(),
      expiryTime: new Date(eventData.expiryTime).toISOString(),
      images: Array.isArray(eventData.images) && eventData.images.length > 0
        ? eventData.images.filter(img => img && img.trim().length > 0)
        : [],
      isContributionRequired: Boolean(eventData.isContributionRequired),
      status: EventStatus.UPCOMING,
      cancelledAt: null,
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    setStored(STORAGE_KEYS.EVENTS, events);
    return { success: true, data: newEvent };
  },

  updateEvent: async (id, updateData) => {
    const events = getStored(STORAGE_KEYS.EVENTS);
    const index = events.findIndex(e => e._id === id);
    if (index === -1) throw new Error('Event not found');

    events[index] = {
      ...events[index],
      title: updateData.title || events[index].title,
      description: updateData.description || events[index].description,
      eventDateTime: updateData.eventDateTime || events[index].eventDateTime,
      expiryTime: updateData.expiryTime || events[index].expiryTime,
      images: updateData.images || events[index].images,
      isContributionRequired: updateData.isContributionRequired !== undefined
        ? updateData.isContributionRequired
        : events[index].isContributionRequired
    };
    setStored(STORAGE_KEYS.EVENTS, events);
    return { success: true, data: events[index] };
  },

  cancelEvent: async (id) => {
    const events = getStored(STORAGE_KEYS.EVENTS);
    const index = events.findIndex(e => e._id === id);
    if (index === -1) throw new Error('Event not found');

    // Rule: Invariant preservation. Payment records remain intact, contributions labeled as cancelled event
    events[index] = {
      ...events[index],
      status: EventStatus.CANCELLED,
      cancelledAt: new Date().toISOString()
    };
    setStored(STORAGE_KEYS.EVENTS, events);
    return { success: true, data: events[index] };
  },

  // Contributions & Payment Verification (SRS 9.3, 6.3, 6.4, 6.6, 7)
  getContributions: async (filter = {}) => {
    let contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const events = getStored(STORAGE_KEYS.EVENTS);

    // Enrich with member and event details
    let enriched = contributions.map(c => {
      const member = members.find(m => m._id === c.memberId) || {
        name: 'Former / Unknown Member',
        email: 'N/A',
        mobileNumber: 'N/A',
        hasRedBorder: false
      };
      const event = events.find(e => e._id === c.eventId) || {
        title: 'Archived Event',
        status: EventStatus.PAST
      };
      return {
        ...c,
        member,
        event,
        isEventCancelled: event.status === EventStatus.CANCELLED
      };
    });

    if (filter.status && filter.status !== 'ALL') {
      enriched = enriched.filter(c => c.status === filter.status);
    }
    if (filter.eventId && filter.eventId !== 'ALL') {
      enriched = enriched.filter(c => c.eventId === filter.eventId);
    }

    // Sort newest first
    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { success: true, data: enriched };
  },

  verifyContribution: async (id, action, rejectionReason = '') => {
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const index = contributions.findIndex(c => c._id === id);
    if (index === -1) throw new Error('Contribution not found');

    const admin = getStored(STORAGE_KEYS.ADMIN, initialAdmin);
    const now = new Date().toISOString();

    if (action === 'APPROVE') {
      contributions[index].status = PaymentStatus.PAID;
      contributions[index].verifiedAt = now;
      contributions[index].verifiedByAdminId = admin._id;
      contributions[index].rejectionReason = null;
    } else if (action === 'REJECT') {
      if (!rejectionReason.trim()) {
        throw new Error('A reason is mandatory when rejecting a submission.');
      }
      contributions[index].status = PaymentStatus.REJECTED;
      contributions[index].verifiedAt = now;
      contributions[index].verifiedByAdminId = admin._id;
      contributions[index].rejectionReason = rejectionReason.trim();
    }
    setStored(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    return { success: true, data: contributions[index] };
  },

  flagFraud: async (id, reason) => {
    if (!reason.trim()) throw new Error('Reason is required to flag fraud');
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const fraudRecords = getStored(STORAGE_KEYS.FRAUD_RECORDS);

    const cIndex = contributions.findIndex(c => c._id === id);
    if (cIndex === -1) throw new Error('Contribution not found');

    const contribution = contributions[cIndex];
    const memberIndex = members.findIndex(m => m._id === contribution.memberId);
    if (memberIndex === -1) throw new Error('Member associated with contribution not found');

    const admin = getStored(STORAGE_KEYS.ADMIN, initialAdmin);
    const now = new Date().toISOString();

    // 1. Mark contribution as rejected and fraudulent
    contributions[cIndex].status = PaymentStatus.REJECTED;
    contributions[cIndex].isFraudulent = true;
    contributions[cIndex].rejectionReason = `[FRAUD FLAGGED]: ${reason}`;
    contributions[cIndex].verifiedAt = now;
    contributions[cIndex].verifiedByAdminId = admin._id;

    // 2. Increment fake strikes
    const updatedCount = (members[memberIndex].fakePaymentCount || 0) + 1;
    const hasRedBorder = updatedCount > FRAUD_RED_BORDER_THRESHOLD || Boolean(members[memberIndex].hasRedBorder);

    members[memberIndex].fakePaymentCount = updatedCount;
    members[memberIndex].hasRedBorder = hasRedBorder;

    // 3. Log into fraud records permanently
    const newFraudLog = {
      _id: 'frd_' + Date.now(),
      memberId: contribution.memberId,
      contributionId: id,
      flaggedByAdminId: admin._id,
      reason: reason.trim(),
      createdAt: now
    };
    fraudRecords.unshift(newFraudLog);

    setStored(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    setStored(STORAGE_KEYS.MEMBERS, members);
    setStored(STORAGE_KEYS.FRAUD_RECORDS, fraudRecords);

    return {
      success: true,
      data: {
        contribution: contributions[cIndex],
        member: members[memberIndex],
        fraudRecord: newFraudLog
      }
    };
  },

  recordOfflineContribution: async (data) => {
    const { memberId, eventId, amount, paymentMode, status } = data;
    if (!memberId || !eventId || !amount) {
      throw new Error('Member, event, and amount are mandatory');
    }
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const admin = getStored(STORAGE_KEYS.ADMIN, initialAdmin);
    const now = new Date().toISOString();

    const newRecord = {
      _id: 'con_off_' + Date.now(),
      memberId,
      eventId,
      amount: Number(amount),
      paymentMode,
      paymentProofUrl: null,
      status: status || PaymentStatus.PAID,
      isOffline: true,
      recordedByAdminId: admin._id,
      verifiedAt: status === PaymentStatus.PAID ? now : null,
      verifiedByAdminId: status === PaymentStatus.PAID ? admin._id : null,
      rejectionReason: null,
      isFraudulent: false,
      createdAt: now
    };

    contributions.unshift(newRecord);
    setStored(STORAGE_KEYS.CONTRIBUTIONS, contributions);
    return { success: true, data: newRecord };
  },

  // Collection Reports (SRS 9.4)
  getCollectionReports: async () => {
    const events = getStored(STORAGE_KEYS.EVENTS);
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);
    const members = getStored(STORAGE_KEYS.MEMBERS);

    const reports = events.map(evt => {
      const eventContributions = contributions.filter(c => c.eventId === evt._id);
      const paidContributions = eventContributions.filter(c => c.status === PaymentStatus.PAID);
      const totalAmount = paidContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
      const uniqueContributors = new Set(paidContributions.map(c => c.memberId)).size;

      const records = eventContributions.map(c => {
        const member = members.find(m => m._id === c.memberId) || { name: 'Former Member', mobileNumber: 'N/A' };
        return {
          id: c._id,
          memberName: member.name,
          mobileNumber: member.mobileNumber,
          amount: c.amount,
          paymentMode: c.paymentMode,
          status: c.status,
          isOffline: c.isOffline,
          date: c.createdAt
        };
      });

      return {
        eventId: evt._id,
        eventName: evt.title,
        eventStatus: evt.status,
        eventDateTime: evt.eventDateTime,
        numberOfContributors: uniqueContributors,
        totalContributionsCount: paidContributions.length,
        totalAmountCollected: totalAmount,
        records
      };
    });

    return { success: true, data: reports };
  },

  // Member Management & Fraud Oversight (SRS 9.5, 7)
  getMembers: async () => {
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const contributions = getStored(STORAGE_KEYS.CONTRIBUTIONS);

    const enriched = members.map(m => {
      const memberContributions = contributions.filter(c => c.memberId === m._id && c.status === PaymentStatus.PAID);
      const totalContributed = memberContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
      return {
        ...m,
        totalContributed,
        contributionCount: memberContributions.length
      };
    });

    return { success: true, data: enriched };
  },

  getMemberFraudHistory: async (memberId) => {
    const fraudRecords = getStored(STORAGE_KEYS.FRAUD_RECORDS);
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const member = members.find(m => m._id === memberId);
    const history = fraudRecords.filter(f => f.memberId === memberId);
    return { success: true, data: { member, history } };
  },

  updateRedBorder: async (memberId, hasRedBorder) => {
    const members = getStored(STORAGE_KEYS.MEMBERS);
    const index = members.findIndex(m => m._id === memberId);
    if (index === -1) throw new Error('Member not found');

    members[index].hasRedBorder = Boolean(hasRedBorder);
    setStored(STORAGE_KEYS.MEMBERS, members);
    return { success: true, data: members[index] };
  },

  // Darshan Settings (SRS 9.6, 5.3)
  getDarshanSettings: async () => {
    const settings = getStored(STORAGE_KEYS.DARSHAN);
    return { success: true, data: settings };
  },

  updateDarshanSettings: async (settingsData) => {
    setStored(STORAGE_KEYS.DARSHAN, settingsData);
    return { success: true, data: settingsData };
  },

  // Notifications (SRS 8.1 - 8.4)
  getNotifications: async () => {
    const notifications = getStored(STORAGE_KEYS.NOTIFICATIONS);
    return { success: true, data: notifications };
  },

  createNotification: async (notifData) => {
    const notifications = getStored(STORAGE_KEYS.NOTIFICATIONS);
    const admin = getStored(STORAGE_KEYS.ADMIN, initialAdmin);
    const newNotif = {
      _id: 'notif_' + Date.now(),
      title: notifData.title.trim(),
      message: notifData.message.trim(),
      targetAudience: notifData.targetAudience,
      targetMemberIds: notifData.targetMemberIds || [],
      expiryDate: new Date(notifData.expiryDate).toISOString(),
      createdByAdminId: admin._id,
      createdAt: new Date().toISOString()
    };
    notifications.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { success: true, data: newNotif };
  },

  updateNotification: async (id, notifData) => {
    const notifications = getStored(STORAGE_KEYS.NOTIFICATIONS);
    const index = notifications.findIndex(n => n._id === id);
    if (index === -1) throw new Error('Notification not found');

    notifications[index] = {
      ...notifications[index],
      title: notifData.title || notifications[index].title,
      message: notifData.message || notifications[index].message,
      targetAudience: notifData.targetAudience || notifications[index].targetAudience,
      targetMemberIds: notifData.targetMemberIds || notifications[index].targetMemberIds,
      expiryDate: notifData.expiryDate || notifications[index].expiryDate
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { success: true, data: notifications[index] };
  },

  deleteNotification: async (id) => {
    let notifications = getStored(STORAGE_KEYS.NOTIFICATIONS);
    notifications = notifications.filter(n => n._id !== id);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return { success: true };
  }
};

