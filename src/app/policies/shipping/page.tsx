import { PolicyLayout } from '@/components/policy/policy-layout';

export const metadata = { title: 'Shipping Policy' };

export default function ShippingPage() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy">
      <h2 className="text-lg text-ink font-display">Delivery area</h2>
      <p>We currently deliver within Accra, Ghana. We plan to expand delivery to additional regions — join our newsletter to be notified when this happens.</p>
      <h2 className="text-lg text-ink font-display pt-4">Processing time</h2>
      <p>Because every bag is handmade to order, please allow 1–2 weeks for your order to be crafted before it is dispatched for delivery. Ready-stock items may ship sooner.</p>
      <h2 className="text-lg text-ink font-display pt-4">Delivery time & fees</h2>
      <p>Once dispatched, delivery within Accra typically takes 1–3 working days. Delivery fees vary by area and are calculated at checkout based on your selected region and city.</p>
      <h2 className="text-lg text-ink font-display pt-4">Order tracking</h2>
      <p>You can track the status of your order at any time using our Track Order page with your order number and the email or phone used at checkout.</p>
      <h2 className="text-lg text-ink font-display pt-4">Delivery issues</h2>
      <p>If your order hasn't arrived within the expected timeframe, please contact us on WhatsApp and we'll investigate right away.</p>
    </PolicyLayout>
  );
}
