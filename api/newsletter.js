import sgMail from "@sendgrid/mail";

export default async function handler(req, res) {
  const ORIGIN = process.env.ALLOWED_ORIGIN || "https://unhs-site.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { email = "", source = "newsletter" } = body;
  if (!email) return res.status(400).json({ ok: false, message: "Email is required." });

  if (process.env.DISABLE_EMAIL === "1" ||
      !process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL || !process.env.TO_EMAIL) {
    return res.status(200).json({ ok: true, stubbed: true });
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: "New newsletter subscriber",
      html: `<p>${email}</p><p>Source: ${source}</p>`
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Email provider error." });
  }
}
// updated newsletter.js
