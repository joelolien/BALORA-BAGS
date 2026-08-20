import { PolicyLayout } from '@/components/policy/policy-layout';

export const metadata = { title: 'Returns & Exchanges' };

export default function ReturnsPage() {
  return (
    <PolicyLayout title="Returns & Exchange Policy">
      <p>Because every Balora bag is handmade to order, we do not accept returns for refunds.</p>
      <p>
        We do, however, offer a hassle-free exchange policy. If something isn't quite right with your order,
        please reach out to us via WhatsApp or Instagram within 5 days of receiving your bag, and we'll do
        our best to make it right.
      </p>
      <h2 className="text-lg text-ink font-display pt-4">Eligibility for exchange</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Item must be unused, unworn, and in its original condition</li>
        <li>Request made within 5 days of delivery</li>
        <li>Proof of purchase (order number) provided</li>
      </ul>
      <h2 className="text-lg text-ink font-display pt-4">Custom & pre-order items</h2>
      <p>Custom colourways and pre-ordered pieces are made specifically for you and are not eligible for exchange unless the item arrives damaged or does not match the agreed specification.</p>
    </PolicyLayout>
  );
}
