'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';

interface Img {
  id: string;
  url: string;
  altText?: string | null;
}

export function ProductGallery({ images, productName }: { images: Img[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const list = images.length ? images : [{ id: 'placeholder', url: '/placeholder-bag.svg', altText: productName }];

  return (
    <div>
      <div className="relative aspect-square bg-sand overflow-hidden group cursor-zoom-in" onClick={() => setLightbox(true)}>
        <Image src={list[active].url} alt={list[active].altText || productName} fill className="object-cover" priority />
        <div className="absolute bottom-3 right-3 bg-cream/90 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={16} />
        </div>
      </div>

      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square bg-sand overflow-hidden border-2 ${
                i === active ? 'border-forest' : 'border-transparent'
              }`}
            >
              <Image src={img.url} alt={img.altText || productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-ink/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-6 right-6 text-cream" aria-label="Close">
            <X size={28} />
          </button>
          <div className="relative w-full max-w-2xl aspect-square">
            <Image src={list[active].url} alt={list[active].altText || productName} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
