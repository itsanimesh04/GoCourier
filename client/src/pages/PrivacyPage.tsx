import { LegalPage, LegalSection } from '../components/LegalPage';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This Privacy Policy explains how GoCourier Private Limited (“GoCourier”, “we”, “us”)
        collects, uses, and protects personal information when you use gocourierservice.com, our
        mobile apps, and related campus delivery services.
      </p>

      <LegalSection title="Information we collect">
        <p>
          We may collect account details (name, phone number, email), campus and drop-point
          preferences, order history, payment-related identifiers from our payment partner
          (Razorpay), device and usage data needed to run the service, and support messages you
          send us.
        </p>
      </LegalSection>

      <LegalSection title="How we use information">
        <p>
          We use this information to create and manage your account, process orders and payments,
          schedule campus batch deliveries, send order updates, prevent fraud and abuse, improve
          the product, and respond to support requests.
        </p>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Card, UPI, and other payment credentials are handled by Razorpay. We do not store full
          card numbers on our servers. We may store payment status, order amounts, and gateway
          reference IDs needed for reconciliation and refunds.
        </p>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          We share information only as needed with payment processors, cloud hosting providers,
          restaurants/partners fulfilling your order, and delivery operations staff. We do not sell
          your personal information.
        </p>
      </LegalSection>

      <LegalSection title="Data retention & security">
        <p>
          We retain order and account records for as long as needed to provide the service, meet
          legal obligations, and resolve disputes. We apply reasonable technical and organizational
          safeguards; no method of transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You may update profile details in the app or website, request account deletion or data
          access by contacting us, and opt out of non-essential marketing messages where offered.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about privacy: email{' '}
          <a className="text-primary underline" href="mailto:support@gocourier.com">
            support@gocourier.com
          </a>{' '}
          or WhatsApp{' '}
          <a className="text-primary underline" href="https://wa.me/919606081463">
            +91 9606081463
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
