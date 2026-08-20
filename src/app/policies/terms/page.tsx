import { PolicyLayout } from '@/components/policy/policy-layout';

export const metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>By accessing or placing an order on balorabags.com, you agree to be bound by these terms and conditions.</p>
      <h2 className="text-lg text-ink font-display pt-4">Orders & pricing</h2>
      <p>All prices are listed in Ghana Cedis (GHS) and are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion, including in cases of suspected fraud or stock unavailability.</p>
      <h2 className="text-lg text-ink font-display pt-4">Payment</h2>
      <p>Payment is required in full at checkout for card and Mobile Money orders. Cash on delivery is available within Accra only, subject to confirmation. Bank transfer orders are held pending confirmation of payment.</p>
      <h2 className="text-lg text-ink font-display pt-4">Product accuracy</h2>
      <p>We make every effort to accurately represent our products, including colours and dimensions. As each bag is handmade, slight variations between pieces are normal and not considered defects.</p>
      <h2 className="text-lg text-ink font-display pt-4">Intellectual property</h2>
      <p>All content on this website, including images, designs, and text, is the property of Balora Bags and may not be reproduced without permission.</p>
      <h2 className="text-lg text-ink font-display pt-4">Limitation of liability</h2>
      <p>Balora Bags is not liable for indirect or incidental damages arising from the use of our products or website, to the extent permitted by Ghanaian law.</p>
      <h2 className="text-lg text-ink font-display pt-4">Governing law</h2>
      <p>These terms are governed by the laws of the Republic of Ghana.</p>
    </PolicyLayout>
  );
}
