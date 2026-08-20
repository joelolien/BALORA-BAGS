'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Message sent! We'll be in touch soon.");
    } catch {
      toast.error('Could not send message. Please try WhatsApp instead.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="section-padding py-16 grid lg:grid-cols-2 gap-16">
      <div>
        <p className="eyebrow mb-2">Get in Touch</p>
        <h1 className="text-3xl md:text-4xl mb-8">Contact Us</h1>

        {sent ? (
          <p className="text-ink/70">Thank you — we've received your message and will respond within 1 business day.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="First name" className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <input required placeholder="Last name" className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <input type="email" required placeholder="Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea required placeholder="Message" className="input-field min-h-[140px]" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" disabled={sending} className="btn-primary">{sending ? 'Sending...' : 'Send Message'}</button>
          </form>
        )}
      </div>

      <div className="space-y-10">
        <div>
          <p className="eyebrow mb-3">Reach Us Directly</p>
          <ul className="text-sm space-y-1 text-ink/70">
            <li>WhatsApp: <a href="https://wa.me/233540784922" className="underline">+233 540 784 922</a></li>
            <li>Email: <a href="mailto:balora.bagss@gmail.com" className="underline">balora.bagss@gmail.com</a></li>
            <li>Instagram: <a href="https://instagram.com/balora_bags" className="underline">@balora_bags</a></li>
            <li>TikTok: <a href="https://tiktok.com/@balora.bags" className="underline">@balora.bags</a></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Business Hours</p>
          <p className="text-sm text-ink/70">Mon–Fri: 9:00 AM – 6:00 PM</p>
          <p className="text-sm text-ink/70">Sat: 10:00 AM – 4:00 PM</p>
          <p className="text-sm text-ink/70">Sun: Closed</p>
        </div>
        <div>
          <p className="eyebrow mb-3">Delivery Area</p>
          <p className="text-sm text-ink/70">We currently deliver within Accra, with other regions of Ghana coming soon.</p>
        </div>
      </div>
    </div>
  );
}
