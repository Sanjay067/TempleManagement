require('dotenv').config();
const { connectToDatabase, disconnectDatabase, Admin, Member, Event, Contribution, Notification, DarshanSettings } = require('@temple/database');
const { PaymentStatus, PaymentMode, EventStatus, TargetAudience } = require('@temple/contracts');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/temple_management';
    console.log(`Connecting to database at ${dbUrl}...`);
    await connectToDatabase(dbUrl);

    console.log('Clearing existing collections...');
    await Admin.deleteMany({});
    await Event.deleteMany({});
    await DarshanSettings.deleteMany({});
    // Note: In development reset we clean up, but production enforces zero deletes.

    console.log('Seeding single admin account (SRS 9.7)...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);
    const admin = await Admin.create({
      name: 'Chief Temple Administrator',
      email: 'admin@temple.org',
      passwordHash
    });

    console.log('Seeding Darshan settings (SRS 9.6 & 5.3)...');
    await DarshanSettings.create({
      dailyKaryakrams: [
        { time: '05:30 AM', title: 'Suprabhata Seva', details: 'Awakening of deities with sacred conch & hymns.' },
        { time: '06:30 AM', title: 'Vishwaroopa Darshan', details: 'First morning darshan.' },
        { time: '08:00 AM', title: 'Kala Sandhi Pooja & Abhishekam', details: 'Ceremonial milk, honey bath.' },
        { time: '11:30 AM', title: 'Uchikala Pooja & Maha Naivedyam', details: 'Midday archana.' },
        { time: '05:00 PM', title: 'Sayarakshai Pooja', details: 'Twilight deeparadhana.' },
        { time: '08:30 PM', title: 'Ardhajama Pooja', details: 'Night prayers and temple closing.' }
      ],
      poojaTimings: 'Morning: 6:00 AM - 12:30 PM | Evening: 4:30 PM - 9:00 PM',
      openingHours: '05:00 AM',
      closingHours: '09:15 PM',
      generalInfo: 'Traditional dress code mandatory. Senior citizen queue available near North tower.',
      updatedByAdminId: admin._id
    });

    console.log('Seeding Events...');
    const event1 = await Event.create({
      title: 'Maha Kumbhabhishekam & Special Yagasalai',
      description: 'Grand sacred consecration ritual with 108 Kalasa Pooja and mass Annadhanam.',
      eventDateTime: new Date('2026-11-28T09:00:00Z'),
      expiryTime: new Date('2026-11-28T22:00:00Z'),
      images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80'],
      isContributionRequired: true,
      status: EventStatus.UPCOMING
    });

    console.log('✅ Temple Admin database successfully seeded!');
    await disconnectDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

