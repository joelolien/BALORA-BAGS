import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  const { firstName, lastName, email, message } = await req.json();
  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Balora Bags <orders@balorabags.com>',
        to: 'balora.bagss@gmail.com',
        replyTo: email,
        subject: `New contact form message from ${firstName} ${lastName}`,
        html: `<p><strong>${firstName} ${lastName}</strong> (${email}) wrote:</p><p>${message}</p>`,
      });
    } catch (err) {
      console.error('Contact email error:', err);
      return NextResponse.json({ error: 'Could not send message.' }, { status: 500 });
    }
  } else {
    console.warn('[contact] RESEND_API_KEY not set — message logged only:', { firstName, lastName, email, message });
  }

  return NextResponse.json({ ok: true });
}
