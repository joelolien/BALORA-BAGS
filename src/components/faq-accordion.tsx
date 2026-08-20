'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Item { q: string; a: string; }
interface Section { title: string; items: Item[]; }

export function FaqAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="eyebrow mb-4">{section.title}</p>
          <div className="divide-y divide-ink/10 border-t border-b border-ink/10">
            {section.items.map((item) => {
              const key = section.title + item.q;
              const isOpen = open === key;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpen(isOpen ? null : key)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm font-medium pr-4">{item.q}</span>
                    <ChevronDown size={16} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <p className="text-sm text-ink/60 pb-4 leading-relaxed">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
