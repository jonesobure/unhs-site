[README.md](https://github.com/user-attachments/files/21907223/README.md)
# UNHS Site

**Ultimate Network for Health Solutions (UNHS)** — a fast, secure landing page with simple serverless APIs for the contact form and newsletter sign-ups.

**Live:** https://unhs-site.vercel.app/

## Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Deploying](#deploying)
- [API endpoints](#api-endpoints)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features
- ⚡️ Static, SEO-friendly **landing page** (`index.html`) styled with Tailwind CDN.
- 📨 **Contact** and **Newsletter** forms wired to serverless APIs (`/api/contact`, `/api/newsletter`).
- 🛡️ CORS, safe JSON parsing, and **stub mode** for frictionless testing.
- 🔐 Email delivery via **SendGrid** (optional until you enable it).
- ☁️ One-click deploys on **Vercel**.

## Tech stack
- Frontend: HTML5, Tailwind CSS (CDN), vanilla JS
- Backend: Vercel Serverless Functions (Node.js, ESM)
- Email: `@sendgrid/mail`
- Hosting/CI/CD: Vercel

---

## Getting started

```bash
# 1) Clone
git clone https://github.com/jonesobure/unhs-site.git
cd unhs-site

# 2) (Optional) Install deps for the serverless functions
npm install
```

> The site will deploy without `npm install` on Vercel (it installs deps for functions automatically).  
> For local dev with `vercel dev`, you’ll want Node.js installed.

---

## Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**.

| Key               | Example/Value                          | Required | Notes |
|-------------------|----------------------------------------|---------:|------|
| `ALLOWED_ORIGIN`  | `https://unhs-site.vercel.app`         | ✅       | CORS allow-list (use your real domain in production). |
| `DISABLE_EMAIL`   | `1` or `0`                             | ✅       | `1` = stub mode (no emails sent; API still returns ok). Great for testing. |
| `SENDGRID_API_KEY`| `SG.xxxxx...`                          | ❌*      | Required when you want to send real emails. |
| `FROM_EMAIL`      | `no-reply@unhs.com`                    | ❌*      | Must be a **verified sender/domain** in SendGrid. |
| `TO_EMAIL`        | `intake@unhs.com`                      | ❌*      | Where contact/newsletter notifications are delivered. |
| `SEND_AUTOREPLY`  | `true` or `false`                      | optional | Auto-reply to contact form submitter when enabled. |

\* Required only when `DISABLE_EMAIL=0`.

---

## Local development

### Option A: Use Vercel CLI (recommended)
```bash
npm i -g vercel
vercel login
vercel link       # link this folder to the Vercel project
vercel env pull .env.local   # optional: pull env vars

# Run locally (reads env from .env.local if present)
vercel dev
```
Visit http://localhost:3000

### Option B: Open the file directly
Open `index.html` in a browser.  
If you’re not running `vercel dev`, the form submits will hit the **deployed** APIs (same-origin in production). If you call from `file://`, CORS is handled by the functions, but using `vercel dev` mirrors production best.

---

## Deploying

1. Push to `main`:
   ```bash
   git add .
   git commit -m "Update site"
   git push
   ```
2. In Vercel, **Import Project** (if not already), or it will auto-deploy on each push.
3. Set **Environment Variables** (see above) and redeploy.

---

## API endpoints

### `POST /api/contact`
- **Body (JSON):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+254700000000",
    "service": "Nutrition Consultancy",
    "message": "Hi, I'd like to book a session."
  }
  ```
- **Responses:**
  - `201 { "ok": true }` — sent (when SendGrid configured)
  - `200 { "ok": true, "stubbed": true }` — stub mode (no email)
  - `400 { "ok": false, "message": "..." }` — validation error
  - `500 { "ok": false, "message": "Email provider error." }`

### `POST /api/newsletter`
- **Body (JSON):**
  ```json
  { "email": "jane@example.com", "source": "hero" }
  ```
- **Responses:** same pattern as contact.

**Quick test (from DevTools Console):**
```js
fetch('/api/contact', { method:'POST',
  headers:{'Content-Type':'application/json'},
  body: JSON.stringify({ name:'Test', email:'you@example.com', message:'Hello' })
}).then(r=>r.json()).then(console.log);
```

---

## Project structure
```
unhs-site/
├─ api/
│  ├─ contact.js          # serverless function: contact form
│  └─ newsletter.js       # serverless function: newsletter signup
├─ index.html             # landing page (Tailwind + JS)
└─ package.json           # only @sendgrid/mail dependency (for functions)
```

---

## Troubleshooting

- **Contact form shows “Network error. Please try again.”**
  - Check Network tab for `/api/contact`.
  - If HTTP **500**, open Vercel → Deployments → **Functions** logs. Likely missing env vars.
  - Enable stub mode: set `DISABLE_EMAIL=1`, redeploy, test again.
- **GET /api/contact shows `{"message":"Method not allowed"}`**
  - That’s expected for GET. Use **POST**.
- **`MODULE_NOT_FOUND @sendgrid/mail` in logs**
  - Ensure `package.json` with `"@sendgrid/mail"` is committed and pushed.
- **Emails not arriving**
  - Verify `FROM_EMAIL` as a sender in SendGrid.
  - Check SendGrid Activity; ensure your API key is correct.
- **CORS issues when testing from another origin**
  - Set `ALLOWED_ORIGIN` to your site URL (no trailing slash), redeploy.

---

## Roadmap
- Store leads/subscribers in a DB (e.g., Supabase) in addition to email.
- Add blog/insights section.
- Replace Tailwind CDN with a compiled build for best performance.
- Add basic e2e tests for API routes.

---

## License
MIT © UNHS — replace with your preferred license.
