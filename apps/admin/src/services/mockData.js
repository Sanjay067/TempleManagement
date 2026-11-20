import { PaymentStatus, PaymentMode, EventStatus, TargetAudience } from '../contracts';

export const initialAdmin = {
  _id: 'admin_001',
  name: 'Chief Temple Administrator',
  email: 'admin@temple.org',
  role: 'SUPER_ADMIN'
};

export const initialMembers = [
  {
    _id: 'mem_001',
    name: 'Arun Kumar S.',
    email: 'arun.kumar@gmail.com',
    mobileNumber: '9840123456',
    address: '14 Sannadhi Street, Madurai - 625001',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    isEmailVerified: true,
    fakePaymentCount: 0,
    hasRedBorder: false,
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    _id: 'mem_002',
    name: 'Sundaram Pillai',
    email: 'sundaram.p@yahoo.com',
    mobileNumber: '9443210987',
    address: '88 West Tower Lane, Madurai - 625001',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    isEmailVerified: true,
    fakePaymentCount: 1,
    hasRedBorder: false,
    createdAt: '2026-08-15T11:30:00.000Z'
  },
  {
    _id: 'mem_003',
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.n@outlook.com',
    mobileNumber: '9789012345',
    address: '42 Agraharam, Thirupparankundram - 625005',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    isEmailVerified: true,
    fakePaymentCount: 0,
    hasRedBorder: false,
    createdAt: '2026-09-01T14:20:00.000Z'
  },
  {
    _id: 'mem_004',
    name: 'Ganesh Moorthy (Fraud Demo)',
    email: 'ganesh.fake@testmail.com',
    mobileNumber: '9894000111',
    address: '10 Bye-Pass Road, Madurai - 625010',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    isEmailVerified: true,
    fakePaymentCount: 6,
    hasRedBorder: true, // Has > 5 strikes! SRS Section 7 Red Border Active
    createdAt: '2026-09-10T16:00:00.000Z'
  },
  {
    _id: 'mem_005',
    name: 'Meenakshi Sundari',
    email: 'meenakshi.s@gmail.com',
    mobileNumber: '9123456780',
    address: '25 East Masi Street, Madurai - 625001',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    isEmailVerified: true,
    fakePaymentCount: 0,
    hasRedBorder: false,
    createdAt: '2026-09-20T10:15:00.000Z'
  },
  {
    _id: 'mem_006',
    name: 'Ramesh Krishnan (Deleted Account)',
    email: 'ramesh.former@gmail.com',
    mobileNumber: '9888776655',
    address: '77 Alagar Kovil Road, Madurai - 625002',
    profilePhotoUrl: null,
    isActive: false, // Self-deleted account; financial history preserved (SRS Section 2.2 & 12)
    isEmailVerified: true,
    fakePaymentCount: 0,
    hasRedBorder: false,
    createdAt: '2026-07-01T08:00:00.000Z'
  }
];

export const initialEvents = [
  {
    _id: 'evt_001',
    title: 'Maha Kumbhabhishekam & Special Yagasalai',
    description: 'Grand sacred consecration ritual accompanied by 108 Kalasa Pooja, Veda Parayanam, and mass Annadhanam for all devotees.',
    eventDateTime: '2026-11-28T09:00:00.000Z',
    expiryTime: '2026-11-28T22:00:00.000Z',
    images: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80'
    ],
    isContributionRequired: true,
    status: EventStatus.UPCOMING,
    cancelledAt: null,
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    _id: 'evt_002',
    title: 'Karthigai Deepam Maha Brahmotsavam',
    description: 'Lighting of the sacred mega Jyothi at sunset on the temple hillock, followed by gold chariot procession and Divya Prabandham chanting.',
    eventDateTime: '2026-12-05T17:30:00.000Z',
    expiryTime: '2026-12-05T23:59:00.000Z',
    images: [
      'https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?w=800&auto=format&fit=crop&q=80'
    ],
    isContributionRequired: true,
    status: EventStatus.UPCOMING,
    cancelledAt: null,
    createdAt: '2026-10-15T12:00:00.000Z'
  },
  {
    _id: 'evt_003',
    title: 'Pradosham & Nandi Abhishekam',
    description: 'Bimonthly auspicious Pradosha Kaala Abhishekam to Lord Shiva and Sri Nandi Devar with milk, honey, sandalwood paste, and sacred vibhuti.',
    eventDateTime: '2026-11-20T16:30:00.000Z',
    expiryTime: '2026-11-20T21:00:00.000Z',
    images: [], // Uses default temple images
    isContributionRequired: true,
    status: EventStatus.UPCOMING,
    cancelledAt: null,
    createdAt: '2026-11-01T08:00:00.000Z'
  },
  {
    _id: 'evt_004',
    title: 'Navaratri Golu & Cultural Sangeetham (Past)',
    description: 'Nine divine nights of classical Carnatic vocal concerts, dance dramas, and special Lalitha Sahasranama archana.',
    eventDateTime: '2026-10-10T18:00:00.000Z',
    expiryTime: '2026-10-20T22:00:00.000Z',
    images: [
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop&q=80'
    ],
    isContributionRequired: true,
    status: EventStatus.PAST,
    cancelledAt: null,
    createdAt: '2026-09-15T09:00:00.000Z'
  },
  {
    _id: 'evt_005',
    title: 'Special Annadhanam Seva (Weather Cancelled)',
    description: 'Free community meal feast for 5,000 pilgrims. Cancelled due to heavy cyclonic weather warning issued by district administration.',
    eventDateTime: '2026-11-05T12:00:00.000Z',
    expiryTime: '2026-11-05T20:00:00.000Z',
    images: [],
    isContributionRequired: true,
    status: EventStatus.CANCELLED,
    cancelledAt: '2026-11-04T15:30:00.000Z',
    createdAt: '2026-10-20T10:00:00.000Z'
  }
];

export const initialContributions = [
  {
    _id: 'con_001',
    memberId: 'mem_001',
    eventId: 'evt_001',
    amount: 1001,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.PENDING, // Needs verification!
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: null,
    verifiedByAdminId: null,
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-11-13T10:15:00.000Z'
  },
  {
    _id: 'con_002',
    memberId: 'mem_002',
    eventId: 'evt_001',
    amount: 2501,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.PENDING, // Needs verification!
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: null,
    verifiedByAdminId: null,
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-11-13T14:30:00.000Z'
  },
  {
    _id: 'con_003',
    memberId: 'mem_003',
    eventId: 'evt_002',
    amount: 501,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.PAID,
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: '2026-11-12T16:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-11-12T15:20:00.000Z'
  },
  {
    _id: 'con_004',
    memberId: 'mem_005',
    eventId: 'evt_001',
    amount: 5001,
    paymentMode: PaymentMode.CASH,
    paymentProofUrl: null,
    status: PaymentStatus.PAID,
    isOffline: true, // Offline recorded by admin
    recordedByAdminId: 'admin_001',
    verifiedAt: '2026-11-11T11:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-11-11T11:00:00.000Z'
  },
  {
    _id: 'con_005',
    memberId: 'mem_002',
    eventId: 'evt_004',
    amount: 1500,
    paymentMode: PaymentMode.BANK_TRANSFER,
    paymentProofUrl: null,
    status: PaymentStatus.PAID,
    isOffline: true,
    recordedByAdminId: 'admin_001',
    verifiedAt: '2026-10-18T10:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-10-18T10:00:00.000Z'
  },
  {
    _id: 'con_006',
    memberId: 'mem_006', // Deleted member's past contribution! Invariant: Preserved!
    eventId: 'evt_004',
    amount: 1000,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.PAID,
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: '2026-10-12T09:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-10-12T08:00:00.000Z'
  },
  {
    _id: 'con_007',
    memberId: 'mem_004', // Fraud member test submission
    eventId: 'evt_001',
    amount: 10000,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.REJECTED,
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: '2026-11-10T12:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: 'Fabricated UPI screenshot with altered transaction ID and timestamp.',
    isFraudulent: true,
    createdAt: '2026-11-10T11:30:00.000Z'
  },
  {
    _id: 'con_008',
    memberId: 'mem_001',
    eventId: 'evt_005', // Cancelled Event contribution! Invariant: Preserved with Cancelled tag!
    amount: 750,
    paymentMode: PaymentMode.UPI,
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: PaymentStatus.PAID,
    isOffline: false,
    recordedByAdminId: null,
    verifiedAt: '2026-11-03T16:00:00.000Z',
    verifiedByAdminId: 'admin_001',
    rejectionReason: null,
    isFraudulent: false,
    createdAt: '2026-11-03T14:00:00.000Z'
  }
];

export const initialFraudRecords = [
  {
    _id: 'frd_001',
    memberId: 'mem_004',
    contributionId: 'con_007',
    flaggedByAdminId: 'admin_001',
    reason: 'Fabricated UPI screenshot with altered transaction ID and timestamp.',
    createdAt: '2026-11-10T12:00:00.000Z'
  },
  {
    _id: 'frd_002',
    memberId: 'mem_004',
    contributionId: 'con_fake_001',
    flaggedByAdminId: 'admin_001',
    reason: 'Duplicate screenshot submitted from a previous year transaction.',
    createdAt: '2026-10-25T11:15:00.000Z'
  },
  {
    _id: 'frd_003',
    memberId: 'mem_004',
    contributionId: 'con_fake_002',
    flaggedByAdminId: 'admin_001',
    reason: 'Edited Google Pay success page graphic with mismatching UTR.',
    createdAt: '2026-10-14T09:40:00.000Z'
  },
  {
    _id: 'frd_004',
    memberId: 'mem_004',
    contributionId: 'con_fake_003',
    flaggedByAdminId: 'admin_001',
    reason: 'Photoshop modified reference number on Paytm receipt.',
    createdAt: '2026-09-30T17:20:00.000Z'
  },
  {
    _id: 'frd_005',
    memberId: 'mem_004',
    contributionId: 'con_fake_004',
    flaggedByAdminId: 'admin_001',
    reason: 'Blank white image submitted as payment proof.',
    createdAt: '2026-09-18T14:10:00.000Z'
  },
  {
    _id: 'frd_006',
    memberId: 'mem_004',
    contributionId: 'con_fake_005',
    flaggedByAdminId: 'admin_001',
    reason: 'Exceeded 5 confirmed fake attempts. Red border triggered per SRS Section 7.',
    createdAt: '2026-09-12T10:00:00.000Z'
  }
];

export const initialNotifications = [
  {
    _id: 'notif_001',
    title: 'Maha Kumbhabhishekam Seva Timings',
    message: 'The holy Yagasalai poojas will commence at 6:00 AM on Nov 28. Devotees are requested to arrive through the North Gopuram entrance.',
    targetAudience: TargetAudience.ALL,
    targetMemberIds: [],
    expiryDate: '2026-11-29T23:59:59.000Z',
    createdByAdminId: 'admin_001',
    createdAt: '2026-11-10T08:30:00.000Z'
  },
  {
    _id: 'notif_002',
    title: 'Special Prasadam Distribution for Donors',
    message: 'Devotees who made Kanikai contributions for Karthigai Deepam can collect their special consecrated laddu prasadam at the administrative counter.',
    targetAudience: TargetAudience.PAID,
    targetMemberIds: [],
    expiryDate: '2026-12-06T20:00:00.000Z',
    createdByAdminId: 'admin_001',
    createdAt: '2026-11-12T14:00:00.000Z'
  },
  {
    _id: 'notif_003',
    title: 'Annual Temple Renovation Fund Invitation',
    message: 'We invite all unregistered and newly joined members to participate in the sanctuary silver kavacham restoration seva.',
    targetAudience: TargetAudience.UNPAID,
    targetMemberIds: [],
    expiryDate: '2026-12-31T23:59:59.000Z',
    createdByAdminId: 'admin_001',
    createdAt: '2026-11-01T10:00:00.000Z'
  }
];

export const initialDarshanSettings = {
  dailyKaryakrams: [
    { time: '05:30 AM', title: 'Suprabhata Seva', details: 'Awakening of deities with sacred conch blowing & Vedic hymns.' },
    { time: '06:30 AM', title: 'Vishwaroopa Darshan', details: 'First morning public darshan and Nirmalya Visarjana.' },
    { time: '08:00 AM', title: 'Kala Sandhi Pooja & Milk Abhishekam', details: 'Morning ceremonial milk, honey, and sacred water bath.' },
    { time: '11:30 AM', title: 'Uchikala Pooja & Maha Naivedyam', details: 'Mid-day grand archana and sacred rice offering.' },
    { time: '05:00 PM', title: 'Sayarakshai Pooja', details: 'Twilight lamps lighting ritual and 108 Deeparadhana.' },
    { time: '08:30 PM', title: 'Ardhajama Pooja', details: 'Night closing prayers, milk offering, and Palliyarai procession.' }
  ],
  poojaTimings: 'Morning: 6:00 AM - 12:30 PM | Evening: 4:30 PM - 9:00 PM',
  openingHours: '05:00 AM',
  closingHours: '09:15 PM',
  generalInfo: 'Special queue for senior citizens and differently-abled devotees is available near the East Gate entrance. Traditional attire is mandatory within the inner prakaram.'
};

