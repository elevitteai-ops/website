/**
 * ═══════════════════════════════════════════════════════════
 *  Elevitte AI – Razorpay Payment Verification API
 *  File: api/verify-payment.js
 *
 *  CRITICAL SECURITY STEP:
 *  Always verify the Razorpay signature server-side before
 *  granting access, sending confirmation emails, or
 *  recording enrollment in your database.
 * ═══════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      course_id,
      course_name,
      customer_name,
      customer_email,
      customer_phone,
    } = req.body;

    // ── 1. Verify signature ──────────────────────────────────
    const body        = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      console.warn('[Razorpay] Signature mismatch – possible tamper attempt');
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    // ── 2. Signature valid – record the enrollment ──────────
    // TODO: Save to your database here. Examples:
    //
    //   MongoDB:
    //     await db.collection('registrations').insertOne({
    //       payment_id: razorpay_payment_id,
    //       order_id:   razorpay_order_id,
    //       course_id, course_name,
    //       customer_name, customer_email, customer_phone,
    //       amount: 101,
    //       status: 'paid',
    //       created_at: new Date(),
    //     });
    //
    //   Google Sheets (via Apps Script URL):
    //     await fetch(process.env.GOOGLE_SCRIPT_URL, {
    //       method: 'POST',
    //       body: JSON.stringify({ payment_id: razorpay_payment_id, course_id, customer_email, ... }),
    //     });

    // ── 3. Send confirmation email ───────────────────────────
    // TODO: Send email via Resend / Nodemailer / SendGrid. Example:
    //
    //   const { Resend } = require('resend');
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from:    'noreply@elevitte.ai',
    //     to:      customer_email,
    //     subject: `Registration Confirmed – ${course_name}`,
    //     html:    `<p>Hi ${customer_name}, your ₹101 token registration for <b>${course_name}</b> is confirmed. Our expert will call you within 24 hours.</p>`,
    //   });

    // ── 4. Notify your team (WhatsApp / email) ───────────────
    // TODO: Send internal alert to your team email / WhatsApp Business API

    console.log(`[Razorpay] Payment verified – ${razorpay_payment_id} | Course: ${course_id} | Customer: ${customer_email}`);

    return res.status(200).json({
      success:    true,
      payment_id: razorpay_payment_id,
      message:    'Payment verified. Expert callback scheduled within 24 hours.',
    });

  } catch (err) {
    console.error('[Razorpay verify-payment error]', err);
    return res.status(500).json({
      success: false,
      error:   'Verification failed',
      details: err.message,
    });
  }
};
