import { LegalPage, LegalSection } from '../components/LegalPage';

export default function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>
        We are here to help with orders, payments, refunds, and account questions for GoCourier
        campus delivery.
      </p>

      <LegalSection title="Customer support">
        <p>
          Email:{' '}
          <a className="text-primary underline" href="mailto:support@gocourier.com">
            support@gocourier.com
          </a>
        </p>
        <p>
          WhatsApp:{' '}
          <a className="text-primary underline" href="https://wa.me/919606081463">
            +91 9606081463
          </a>
        </p>
        <p>Typical response time: within a few hours during campus service evenings.</p>
      </LegalSection>

      <LegalSection title="Business entity">
        <p>GoCourier Private Limited</p>
        <p>Website: https://gocourierservice.com</p>
        <p>
          For payment-gateway or compliance inquiries, use the email above with subject line
          “Compliance”.
        </p>
      </LegalSection>

      <LegalSection title="Policies">
        <p>
          Please also review our Privacy Policy, Terms & Conditions, Refund Policy, and Delivery
          Policy linked at the bottom of this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
