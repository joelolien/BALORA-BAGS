'use client';

import { MessageCircle } from 'lucide-react';

export function WhatsAppButton({ message = "Hi Balora Bags! I'd like to ask about a bag." }: { message?: string }) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '233540784922';
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle size={26} fill="white" />
    </a>
  );
}
