import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  // Support both JSON and form-encoded
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { name = "", email = "", phone = "", service = "", message = "" } = body;

  // super basic validation
  if (!name || !email || !message) return res.status(400).json({ ok: false, message: "Name, email and message are required." });

  // Email your team
  await sgMail.send({
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: "New UNHS enquiry",
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Service:</strong> ${service || "-"}</p>
      <p><strong>Message:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>
    `
  });

  // Optional auto-reply
  if (process.env.SEND_AUTOREPLY === "true") {
    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "We received your message",
      html: `<p>Hi ${name.split(" ")[0]},</p><p>Thanks for contacting UNHS. Our team will reply shortly.</p>`
    });
  }

  return res.status(201).json({ ok: true });
}
