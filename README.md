# Elevitte AI – Production Website
### AI for Everyone · Future Skills. Real Growth.

> **Complete, domain-ready website with Razorpay ₹101 token registration integrated end-to-end.**

---

## 📁 File Structure

```
elevitte-ai/
│
├── index.html              ← Complete website (all HTML + CSS + JS in one file)
│
├── api/
│   ├── create-order.js     ← Razorpay order creation (serverless / Express)
│   └── verify-payment.js   ← Razorpay signature verification (serverless / Express)
│
├── public/
│   ├── logo.png            ← ⚠️ ADD YOUR LOGO HERE
│   ├── favicon.ico         ← ⚠️ ADD YOUR FAVICON HERE
│   └── og-image.png        ← ⚠️ ADD OG IMAGE HERE (1200×630px)
│
├── server.js               ← Express server (for cPanel / VPS hosting)
├── package.json            ← Node.js dependencies
├── vercel.json             ← Vercel deployment config
├── .env.example            ← Environment variables template
└── .gitignore
```

---

## ⚡ QUICKSTART (5 minutes to live)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### Step 3 — Add your Razorpay Key to index.html
Open `index.html`, find this line (around line 1640):
```js
const RZP_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX';
```
Replace with your actual **Razorpay Key ID** (Test for dev, Live for production).

### Step 4 — Start locally
```bash
npm start
# Opens at http://localhost:3000
```

---

## 🚀 Deployment Options

### Option A — Vercel (Recommended, Free)

**Fastest deployment — 2 minutes:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Go live
vercel --prod
```

**Or connect via GitHub:**
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework: **Other** (not Next.js)
4. Add Environment Variables (from `.env.example`)
5. Click **Deploy** — done ✅

**Add your domain:**
- Vercel Dashboard → Your Project → Settings → Domains
- Add `elevitte.ai` → follow DNS instructions


### Option B — cPanel / Hostinger / GoDaddy

1. Zip this entire folder
2. Upload via cPanel File Manager to `public_html/`
3. In cPanel → **Node.js** section → Create Application:
   - Node version: 18+
   - Application root: `public_html/elevitte-ai`
   - Application startup file: `server.js`
4. Add Environment Variables in cPanel Node.js panel
5. Click **Start**


### Option C — VPS (DigitalOcean / AWS / Hetzner)

```bash
# On your server
git clone <your-repo> /var/www/elevitte-ai
cd /var/www/elevitte-ai
npm install

# Start with PM2 (keeps running after logout)
npm install -g pm2
pm2 start server.js --name elevitte-ai
pm2 save
pm2 startup

# Nginx reverse proxy (point port 80 → 3000)
# See nginx config example below
```

**Nginx config** (`/etc/nginx/sites-available/elevitte-ai`):
```nginx
server {
    listen 80;
    server_name elevitte.ai www.elevitte.ai;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then add SSL: `certbot --nginx -d elevitte.ai -d www.elevitte.ai`


### Option D — Static Hosting (GitHub Pages / Netlify)

If you only need the frontend (no backend order verification):

1. Host `index.html` on GitHub Pages, Netlify, or any CDN
2. The Razorpay integration works in "client-only" mode (fallback in the code)
3. **Note:** Without the backend, signature verification is skipped — fine for MVP

---

## 🔑 Razorpay Setup

### Get Your API Keys
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Sign up / log in
3. Navigate to: **Settings → API Keys → Generate Test Key**
4. Copy **Key ID** and **Key Secret**

### Add Keys to Your Project

**In `.env`:**
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**In `index.html`** (frontend — only Key ID, never Secret):
```js
const RZP_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX';
```

### Switch to LIVE (Production)
1. Complete KYC on Razorpay Dashboard
2. Generate Live API Keys (Settings → API Keys → Live mode)
3. Replace `rzp_test_` keys with `rzp_live_` keys in both `.env` and `index.html`
4. That's it — no other code changes needed

### Test Payments (Test Mode)
Use these test card details:
| Field    | Value                  |
|----------|------------------------|
| Card No. | `4111 1111 1111 1111`  |
| Expiry   | Any future date        |
| CVV      | Any 3 digits           |
| OTP      | `1234`                 |

**Test UPI:** `success@razorpay`

---

## 🌍 Environment Variables

| Variable              | Required | Description                              |
|-----------------------|----------|------------------------------------------|
| `RAZORPAY_KEY_ID`     | ✅ Yes   | Razorpay public key (starts with `rzp_`) |
| `RAZORPAY_KEY_SECRET` | ✅ Yes   | Razorpay secret key (backend only)       |
| `SITE_URL`            | ✅ Yes   | Your domain e.g. `https://elevitte.ai`   |
| `PORT`                | Optional | Server port (default: 3000)              |
| `RESEND_API_KEY`      | Optional | For confirmation emails via Resend       |
| `GOOGLE_SCRIPT_URL`   | Optional | For Google Sheets lead logging           |

**On Vercel:** Add via Dashboard → Project → Settings → Environment Variables

---

## 🖼️ Add Your Logo

1. Export logo as PNG with transparent background (min 200×200px)
2. Save as `public/logo.png`
3. In `index.html`, find these two places and uncomment the `<img>` tag:
   - Navbar (search: `<!-- Logo image`)
   - Footer (same pattern)
4. For favicon: convert to `.ico` at [favicon.io](https://favicon.io), save as `public/favicon.ico`

---

## 📧 Send Confirmation Emails After Payment

In `api/verify-payment.js`, find the `Step 3` comment block and add:

**Using Resend (recommended):**
```bash
npm install resend
```
```js
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from:    'noreply@elevitte.ai',
  to:      customer_email,
  subject: `Expert Call Confirmed – ${course_name}`,
  html: `
    <h2>Hi ${customer_name}! 🎉</h2>
    <p>Your ₹101 token registration for <b>${course_name}</b> is confirmed.</p>
    <p>Our AI expert will call you at <b>${customer_phone}</b> within 24 hours.</p>
    <p>Payment ID: ${razorpay_payment_id}</p>
    <p>— Team Elevitte AI</p>
  `,
});
```

---

## 📊 Log Registrations to Google Sheets

1. Create a Google Sheet with columns: `Timestamp | Name | Email | Phone | Course | Payment ID`
2. Extensions → Apps Script → paste:
```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.customer_name, d.customer_email,
    d.customer_phone, d.course_name, d.payment_id]);
  return ContentService.createTextOutput('OK');
}
```
3. Deploy → Web App → Anyone
4. Copy URL → add as `GOOGLE_SCRIPT_URL` in `.env`
5. In `verify-payment.js` uncomment the Google Sheets fetch block

---

## 🔍 Key Files to Edit Before Launch

| File | What to Change |
|------|----------------|
| `index.html` | `RZP_KEY_ID` → your live key |
| `index.html` | `hello@elevitte.ai` → your email |
| `index.html` | `+91 99990 00000` → your phone |
| `index.html` | Social media URLs in Footer |
| `index.html` | `https://elevitte.ai` → your domain |
| `.env` | All Razorpay keys + SITE_URL |
| `public/logo.png` | Your actual logo |
| `public/favicon.ico` | Your favicon |

---

## 💡 Payment Flow Summary

```
User clicks "Book Expert Call"
        ↓
Payment Modal opens (₹101 token)
        ↓
Frontend calls POST /api/create-order
        ↓
Backend creates Razorpay Order → returns order_id
        ↓
Razorpay Checkout opens (UPI / Card / NetBanking)
        ↓
User pays ₹101
        ↓
Frontend calls POST /api/verify-payment
        ↓
Backend verifies HMAC signature
        ↓
Send confirmation email + log to DB/Sheets
        ↓
Success screen shown — "Expert calling within 24 hrs"
```

---

## 🛟 Support

- Razorpay docs: [razorpay.com/docs](https://razorpay.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)
- Email: hello@elevitte.ai

---

*© 2025 Elevitte AI · Future Skills. Real Growth.*
