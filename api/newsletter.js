import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { email = "", source = "newsletter" } = body;

  if (!email) return res.status(400).json({ ok: false, message: "Email is required." });

  // For now, just notify your team. Later, connect Mailchimp/SendGrid Marketing.
  await sgMail.send({
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: "New newsletter subscriber",
    html: `<p>${email}</p><p>Source: ${source}</p>`
  });

  return res.status(201).json({ ok: true });
}
