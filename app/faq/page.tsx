import { FaqAccordion } from '@/components/faq-accordion';

export const metadata = { title: 'FAQ', description: 'Answers to common questions about delivery, payment, returns and more.' };

const FAQ_SECTIONS = [
  {
    title: 'Delivery & Returns',
    items: [
      { q: 'Where do you deliver to?', a: "We currently deliver within Accra only. We're working on expanding to other regions of Ghana soon — sign up to our newsletter to be notified." },
      { q: 'How long does delivery take?', a: "Once your order is ready, we'll message you on WhatsApp to arrange delivery via Yango — timing depends on your location and rider availability at that time." },
      { q: 'What is your processing time?', a: 'Our bags are handmade to order, so processing times vary with order volume. Please allow 1–2 weeks for your bag to be made and prepared for delivery.' },
      { q: 'Do you accept returns?', a: 'We do not accept returns. However, we offer a hassle-free exchange policy — reach out via WhatsApp or Instagram within 5 days of receiving your bag.' },
    ],
  },
  {
    title: 'Payment',
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept MTN MoMo, Vodafone Cash, AirtelTigo Money, Visa, Mastercard (via Paystack), bank transfer, and cash on delivery within Accra.' },
      { q: 'Is my payment secure?', a: 'Yes. Card and Mobile Money payments are processed securely through Paystack and verified server-side — we never store your card or MoMo PIN.' },
      { q: 'What payment is required for pre-orders?', a: 'All pre-orders and custom orders require upfront payment before production begins.' },
    ],
  },
  {
    title: 'Products & Care',
    items: [
      { q: 'How do I care for my bag?', a: 'Hand wash with a gentle soap and lay flat to dry. Avoid machine washing, wringing, or prolonged direct sunlight to preserve colour and shape.' },
      { q: 'Can I place a custom order?', a: 'Yes — custom colourways, sizes, handle lengths, and personalised details are available. Send us a DM on Instagram or WhatsApp to get started.' },
      { q: 'Will sold out items be restocked?', a: 'Some popular styles may be restocked in future drops. Subscribe to our newsletter or follow our socials to know first.' },
    ],
  },
  {
    title: 'Orders & Tracking',
    items: [
      { q: 'How do I track my order?', a: 'Use our Track Order page with your order number and the email or phone used at checkout.' },
      { q: 'Can I change my delivery address after ordering?', a: 'Contact us on WhatsApp as soon as possible — we can usually update delivery details before your order ships.' },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="section-padding py-16 max-w-2xl mx-auto">
      <p className="eyebrow mb-2">Got Questions?</p>
      <h1 className="text-3xl md:text-4xl mb-10">Frequently Asked Questions</h1>
      <FaqAccordion sections={FAQ_SECTIONS} />
    </div>
  );
}
