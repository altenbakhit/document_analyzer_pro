import nodemailer from "nodemailer";

const ADMIN_EMAIL = "bakhitzhankenzhebayev@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function notifyAdmin(subject: string, html: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured, skipping email notification");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Alten Consulting" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email notification error:", error);
  }
}

export function contactNotificationEmail(data: {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
}) {
  const subject = `Новая заявка от ${data.name}`;
  const html = `
    <h2>Новая заявка с сайта</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;font-weight:bold">Имя:</td><td style="padding:8px">${data.name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Телефон:</td><td style="padding:8px"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
      ${data.email ? `<tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${data.email}</td></tr>` : ""}
      <tr><td style="padding:8px;font-weight:bold">Сообщение:</td><td style="padding:8px">${data.message}</td></tr>
    </table>
    <br>
    <a href="https://altenconsulting.vercel.app/admin/contacts">Открыть в админке</a>
  `;
  return { subject, html };
}

export function paymentNotificationEmail(data: {
  userName: string;
  userEmail: string;
  plan: string;
  amount: number;
  method: string;
}) {
  const subject = `Оплата ${data.amount}₸ — ${data.plan} (${data.method})`;
  const html = `
    <h2>Новая оплата</h2>
    <table style="border-collapse:collapse;width:100%">
      <tr><td style="padding:8px;font-weight:bold">Клиент:</td><td style="padding:8px">${data.userName}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Email:</td><td style="padding:8px">${data.userEmail}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Тариф:</td><td style="padding:8px">${data.plan}</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Сумма:</td><td style="padding:8px">${data.amount}₸</td></tr>
      <tr><td style="padding:8px;font-weight:bold">Способ:</td><td style="padding:8px">${data.method}</td></tr>
    </table>
    <br>
    <a href="https://altenconsulting.vercel.app/admin/payments">Открыть в админке</a>
  `;
  return { subject, html };
}
