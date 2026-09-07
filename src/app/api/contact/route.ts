import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { firstName, lastName, email, message } = await req.json();
  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  await sendEmail(
    'balora.bagss@gmail.com',
    `New contact form message from ${firstName} ${lastName}`,
    `<p><strong>${firstName} ${lastName}</strong> (${email}) wrote:</p><p>${message}</p>`,
    email
  );

  return NextResponse.json({ ok: true });
}
