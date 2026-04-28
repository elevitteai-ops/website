/**
 * ═══════════════════════════════════════════════════════════
 *  Elevitte AI – Express.js Standalone Server
 *  File: server.js
 *
 *  Use this if you are hosting on:
 *    • cPanel / Hostinger / GoDaddy (Node.js apps)
 *    • DigitalOcean / AWS / Railway VPS
 *    • Any server where you run Node.js directly
 *
 *  Start: node server.js
 *  PM2:   pm2 start server.js --name elevitte-ai
 * ═══════════════════════════════════════════════════════════
 */

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const createOrderHandler  = require('./api/create-order');
const verifyPaymentHandler = require('./api/verify-payment');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware
app.use(cors({ origin: process.env.SITE_URL || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // Serves index.html + assets

// ── API Routes
app.post('/api/create-order',   createOrderHandler);
app.post('/api/verify-payment', verifyPaymentHandler);

// ── Fallback to index.html (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   Elevitte AI Server running             ║
  ║   → http://localhost:${PORT}               ║
  ╚══════════════════════════════════════════╝
  `);
});
