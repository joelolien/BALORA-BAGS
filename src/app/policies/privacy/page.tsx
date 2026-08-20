import { PolicyLayout } from '@/components/policy/policy-layout';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        Balora Bags ("we", "us", "our") respects your privacy. This policy explains what personal
        information we collect when you use balorabags.com and how we use it.
      </p>
      <h2 className="text-lg text-ink font-display pt-4">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>Contact details you provide — name, email, phone number, delivery address</li>
        <li>Order and payment information (payment card/MoMo details are processed directly by Paystack and never stored on our servers)</li>
        <li>Account information if you register — name, email, encrypted password</li>
        <li>Basic usage data such as pages visited, for improving our website</li>
      </ul>
      <h2 className="text-lg text-ink font-display pt-4">How we use your information</h2>
      <p>We use your information to process and deliver your orders, communicate order updates, respond to enquiries, and improve our products and service. We do not sell your personal information to third parties.</p>
      <h2 className="text-lg text-ink font-display pt-4">Third-party services</h2>
      <p>We use trusted third parties to operate our store, including Paystack for payment processing, Cloudinary for image hosting, and Resend for transactional emails. Each provider processes data under their own privacy policy.</p>
      <h2 className="text-lg text-ink font-display pt-4">Your rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting balora.bagss@gmail.com.</p>
      <h2 className="text-lg text-ink font-display pt-4">Contact</h2>
      <p>Questions about this policy can be sent to balora.bagss@gmail.com.</p>
    </PolicyLayout>
  );
}
