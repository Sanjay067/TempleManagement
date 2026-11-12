const express = require('express');
const cors = require('cors');
const { successResponse, errorResponse, ErrorCode } = require('../../../packages/contracts');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json(successResponse({ status: 'healthy', service: 'client-server' }));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json(errorResponse(ErrorCode.NOT_FOUND, `Route not found: ${req.originalUrl}`));
});

module.exports = app;
