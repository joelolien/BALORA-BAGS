import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Balora Bags <orders@balorabags.com>';

async function send(to: string, subject: string, html: string) {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

const wrapper = (title: string, body: string) => `
  <div style="font-family: Georgia, serif; background:#F6F1E7; padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#FBF8F2;border:1px solid #E6DAC3;padding:32px;">
      <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:12px;color:#B9704A;margin:0 0 24px;">Balora Bags</p>
      <h1 style="font-size:22px;color:#241F19;margin:0 0 16px;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#3E4A37;">${body}</div>
      <p style="margin-top:32px;font-size:12px;color:#8a8378;">Handmade with love in Accra, Ghana</p>
    </div>
  </div>`;

export async function sendWelcomeEmail(to: string, name: string) {
  await send(
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
  await send(
    to,
    `Order Confirmed — ${orderNumber}`,
    wrapper(
      'Thank you for your order',
      `<p>We've received order <strong>${orderNumber}</strong>.</p>${itemsHtml}<p style="margin-top:16px;"><strong>Total: ${total}</strong></p><p>We'll notify you as soon as your order is on its way.</p>`
    )
  );
}

export async function sendPaymentSuccessEmail(to: string, orderNumber: string) {
  await send(
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
  await send(
    to,
    `Order Update — ${orderNumber}`,
    wrapper('Your order status changed', `<p>Order <strong>${orderNumber}</strong> is now <strong>${friendly[status] ?? status}</strong>.</p>`)
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await send(
    to,
    'Reset your Balora Bags password',
    wrapper(
      'Reset your password',
      `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}" style="color:#B9704A;">Reset Password</a></p><p>If you didn't request this, you can ignore this email.</p>`
    )
  );
}
