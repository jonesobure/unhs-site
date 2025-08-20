import sgMail from "@sendgrid/mail";

export default async function handler(req, res) {
  // CORS (allow your deployed site)
  const ORIGIN = process.env.ALLOWED_ORIGIN || "https://unhs-site.vercel.app";
  res.setHeader("Access-Control-Allow-Origin", ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  // Parse body safely
  let body = req.body || {};
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { name = "", email = "", phone = "", service = "", message = "" } = body;
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, message: "Name, email and message are required." });
  }

  // Skip real email while testing, or if env not set
  if (process.env.DISABLE_EMAIL === "1" ||
      !process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL || !process.env.TO_EMAIL) {
    return res.status(200).json({ ok: true, stubbed: true });
  }

  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to: process.env.TO_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: "New UNHS enquiry",
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "-"}</p>
        <p><strong>Service:</strong> ${service || "-"}</p>
        <p><strong>Message:</strong><br/>${String(message).replace(/\n/g,"<br/>")}</p>`
    });

    if (process.env.SEND_AUTOREPLY === "true") {
      await sgMail.send({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: "We received your message",
        html: `<p>Hi ${name.split(" ")[0]}, thanks for contacting UNHS. We’ll reply shortly.</p>`
      });
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Email provider error." });
  }
}
// updated contacts.js
