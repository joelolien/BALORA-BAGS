import nodemailer from 'nodemailer';

/**
 * Sends real emails using a free Gmail account instead of a paid domain +
 * email service. Requires GMAIL_USER (the Gmail address) and
 * GMAIL_APP_PASSWORD (a 16-character App Password generated in that
 * Google Account's security settings — NOT the regular Gmail password).
 */
const gmailUser = process.env.GMAIL_USER;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const transporter =
  gmailUser && gmailAppPassword
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailAppPassword },
      })
    : null;

const FROM = gmailUser ? `Balora Bags <${gmailUser}>` : 'Balora Bags <orders@balorabags.com>';

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!transporter) {
    console.warn(`[email] GMAIL_USER/GMAIL_APP_PASSWORD not set — skipping email "${subject}" to ${to}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html, replyTo });
  } catch (err) {
    console.error('[email] Failed to send:', err);
  }
}

const wrapper = (title: string, body: string) => `
  <div style="font-family: Georgia, serif; background:#FBF0F2; padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#FEF9FA;border:1px solid #F0DCE1;padding:32px;">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:12px;color:#B97690;margin:0 0 24px;">Balora Bags</p>
      <h1 style="font-size:22px;color:#251F23;margin:0 0 16px;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#8B6B80;">${body}</div>
      <p style="margin-top:32px;font-size:12px;color:#8a8378;">Handmade with love in Accra, Ghana</p>
    </div>
  </div>`;

export async function sendWelcomeEmail(to: string, name: string) {
  await sendEmail(
    to,
    'Welcome to Balora Bags',
    wrapper('Welcome, ' + name, `<p>Your account has been created. Start browsing our handmade collection whenever you're ready.</p>`)
  );
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  total: string,
  itemsHtml: string
) {
  await sendEmail(
    to,
    `Order Confirmed — ${orderNumber}`,
    wrapper(
      'Thank you for your order',
      `<p>We've received order <strong>${orderNumber}</strong>.</p>${itemsHtml}<p style="margin-top:16px;"><strong>Total: ${total}</strong></p><p>We'll notify you as soon as your order is on its way.</p>`
    )
  );
}

export async function sendPaymentSuccessEmail(to: string, orderNumber: string) {
  await sendEmail(
    to,
    `Payment Received — ${orderNumber}`,
    wrapper('Payment received', `<p>We've confirmed payment for order <strong>${orderNumber}</strong>. Your bag is now being prepared.</p>`)
  );
}

export async function sendOrderStatusUpdateEmail(to: string, orderNumber: string, status: string) {
  const friendly: Record<string, string> = {
    CONFIRMED: 'confirmed',
    PROCESSING: 'being made',
    READY_FOR_DELIVERY: 'ready for delivery',
    SHIPPED: 'on its way to you',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  };
  await sendEmail(
    to,
    `Order Update — ${orderNumber}`,
    wrapper('Your order status changed', `<p>Order <strong>${orderNumber}</strong> is now <strong>${friendly[status] ?? status}</strong>.</p>`)
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    'Reset your Balora Bags password',
    wrapper(
      'Reset your password',
      `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}" style="color:#B97690;">Reset Password</a></p><p>If you didn't request this, you can ignore this email.</p>`
    )
  );
}
