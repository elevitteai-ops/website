/**
 * ═══════════════════════════════════════════════════════════
 *  Elevitte AI – Razorpay Order Creation API
 *  File: api/create-order.js
 *
 *  Deploy as:
 *    • Vercel Serverless Function  → place in /api/
 *    • Express.js route            → require and mount as POST handler
 *    • Node.js standalone          → see server.js
 *
 *  This endpoint:
 *    1. Receives course_id + amount from the frontend
 *    2. Creates a Razorpay Order (server-side, secure)
 *    3. Returns order_id + amount to the browser checkout
 * ═══════════════════════════════════════════════════════════
 */

const Razorpay = require('razorpay');

// ── Razorpay client (uses env vars set in .env or Vercel dashboard)
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Vercel / Next.js serverless handler
module.exports = async function handler(req, res) {
  // CORS headers (adjust origin to your domain in production)
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { course_id, course_name, amount = 101 } = req.body;

    if (!course_id || !course_name) {
      return res.status(400).json({ error: 'course_id and course_name are required' });
    }

    // Razorpay expects amount in paise (₹1 = 100 paise)
    const amountPaise = Math.round(Number(amount) * 100);

    if (amountPaise < 100) {
      return res.status(400).json({ error: 'Minimum amount is ₹1' });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `elevitte_${course_id}_${Date.now()}`,
      notes: {
        course_id,
        course_name,
        source: 'elevitte-ai-website',
      },
    });

    return res.status(200).json({
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      receipt:  order.receipt,
    });

  } catch (err) {
    console.error('[Razorpay create-order error]', err);
    return res.status(500).json({
      error: 'Failed to create Razorpay order',
      details: err.message,
    });
  }
};
