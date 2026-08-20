import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  // Always respond with success to avoid leaking which emails have accounts.
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/reset-password?token=${token}`;
    sendPasswordResetEmail(user.email, resetUrl).catch(() => {});
  }

  return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' });
}
