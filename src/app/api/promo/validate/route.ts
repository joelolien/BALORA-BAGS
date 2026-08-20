import { NextResponse } from 'next/server';
import { validatePromoCode, priceCart } from '@/lib/pricing';

export async function POST(req: Request) {
  const { code, lines } = await req.json();
  if (!code || !Array.isArray(lines)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const { subtotal } = await priceCart(lines);
    const result = await validatePromoCode(code, subtotal);
    if (!result.valid) {
      return NextResponse.json({ valid: false, message: result.message }, { status: 200 });
    }
    return NextResponse.json({
      valid: true,
      discountAmount: result.discountAmount,
      code: result.promo.code,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Could not validate code.' }, { status: 400 });
  }
}
