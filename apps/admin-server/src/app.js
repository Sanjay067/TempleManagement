require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { successResponse, errorResponse, ErrorCode } = require('@temple/contracts');
const { connectToDatabase } = require('@temple/database');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const eventsRoutes = require('./routes/events.routes');
const contributionsRoutes = require('./routes/contributions.routes');
const membersRoutes = require('./routes/members.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const darshanRoutes = require('./routes/darshan.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get(['/health', '/api/health'], (req, res) => {
  res.json(successResponse({ status: 'healthy', service: 'admin-server', port: 5002 }));
});

// Admin API Routes (Port 5002)
app.use('/api/v1/admin/auth', authRoutes);
app.use('/api/v1/admin/dashboard', dashboardRoutes);
app.use('/api/v1/admin/events', eventsRoutes);
app.use('/api/v1/admin/contributions', contributionsRoutes);
app.use('/api/v1/admin/members', membersRoutes);
app.use('/api/v1/admin/notifications', notificationsRoutes);
app.use('/api/v1/admin/darshan-settings', darshanRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, `Route not found on admin server: ${req.originalUrl}`));
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Admin Server Error]', err);
  res.status(err.status || 500).json(errorResponse(ErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Internal server error'));
});

const PORT = process.env.PORT || 5002;

// Auto-start when executed directly
if (require.main === module) {
  const startServer = async () => {
    try {
      const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/temple_management';
      console.log(`[Admin Server] Attempting database connection at ${dbUrl}...`);
      await connectToDatabase(dbUrl);
    } catch (dbErr) {
      console.warn('[Admin Server] Running without live MongoDB connection. Fallback endpoints active.');
    }

    app.listen(PORT, () => {
      console.log(`🛕 Temple Admin API Server running on http://localhost:${PORT}`);
    });
  };

  startServer();
}

module.exports = app;
