'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/cart-context';
import { formatGHS } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cash_on_delivery' | 'bank_transfer'>('paystack');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ discountAmount: number; code: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const discount = promoResult?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const lines = useMemo(
    () => items.map((i) => ({ productId: i.productId, quantity: i.quantity, colour: i.colour, variantInfo: i.variantInfo })),
    [items]
  );

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) e.customerEmail = 'Enter a valid email';
    if (form.customerPhone.trim().length < 9) e.customerPhone = 'Enter a valid WhatsApp number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, lines }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.message || data.error || 'Invalid promo code');
        setPromoResult(null);
        return;
      }
      setPromoResult({ discountAmount: data.discountAmount, code: data.code });
      toast.success(`Promo code ${data.code} applied`);
    } catch {
      toast.error('Could not validate promo code');
    } finally {
      setPromoLoading(false);
    }
  }

  async function submitOrder() {
    if (items.length === 0) {
      toast.error('Your bag is empty');
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          promoCode: promoResult?.code,
          lines,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      clearCart();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/checkout/success?order=${data.orderNumber}&method=${paymentMethod}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="section-padding py-24 text-center">
        <p className="text-ink/60 mb-4">Your bag is empty.</p>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="section-padding py-12 grid lg:grid-cols-[1fr_420px] gap-14">
      <div>
        <p className="eyebrow mb-2">Checkout</p>
        <h1 className="text-3xl md:text-4xl mb-8">Complete your order</h1>

        <div className="space-y-8">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-3">Your Details</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <input className="input-field" placeholder="Full name" value={form.customerName} onChange={(e) => update('customerName', e.target.value)} />
                {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
              </div>
              <div>
                <input className="input-field" placeholder="WhatsApp number" value={form.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} />
                {errors.customerPhone && <p className="text-xs text-red-600 mt-1">{errors.customerPhone}</p>}
              </div>
            </div>
            <div>
              <input className="input-field" placeholder="Email address" value={form.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} />
              {errors.customerEmail && <p className="text-xs text-red-600 mt-1">{errors.customerEmail}</p>}
            </div>
            <p className="text-xs text-ink/50">
              We'll message you on WhatsApp to arrange delivery once your order is ready.
            </p>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-3">Payment Method</legend>
            <div className="space-y-2">
              {[
                { value: 'paystack', label: 'Pay Now — Mobile Money / Card (via Paystack)' },
                { value: 'bank_transfer', label: 'Bank Transfer (details sent after order)' },
                { value: 'cash_on_delivery', label: 'Cash on Delivery' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 border border-ink/15 px-4 py-3 cursor-pointer has-[:checked]:border-forest">
                  <input type="radio" name="paymentMethod" checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value as any)} />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="bg-paper p-6 h-fit">
        <p className="eyebrow mb-4">Order Summary</p>
        <ul className="space-y-3 mb-5">
          {items.map((i) => (
            <li key={i.productId + (i.colour ?? '')} className="flex justify-between text-sm">
              <span className="text-ink/70">{i.quantity} × {i.name}{i.colour ? ` (${i.colour})` : ''}</span>
              <span>{formatGHS((i.salePrice ?? i.price) * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mb-5">
          <input className="input-field" placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
          <button onClick={applyPromo} disabled={promoLoading} className="btn-secondary shrink-0 px-4">
            {promoLoading ? '...' : 'Apply'}
          </button>
        </div>

        <div className="space-y-2 text-sm border-t border-ink/10 pt-4">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatGHS(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-clay-dark"><span>Discount ({promoResult?.code})</span><span>-{formatGHS(discount)}</span></div>}
          <div className="flex justify-between text-base font-medium border-t border-ink/10 pt-2 mt-2">
            <span>Total</span><span>{formatGHS(total)}</span>
          </div>
        </div>

        <button onClick={submitOrder} disabled={submitting} className="btn-primary w-full mt-6">
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
        <p className="text-xs text-ink/40 mt-3">Delivery is arranged separately after your order is confirmed.</p>
      </div>
    </div>
  );
}
