import { LegalPage, LegalSection } from '../components/LegalPage';

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        This policy describes how GoCourier Private Limited handles cancellations, missing or
        damaged items, and refunds for orders placed through our website and apps.
      </p>

      <LegalSection title="Cancellations">
        <p>
          You may request cancellation before the order is locked for procurement for that campus
          batch. Once procurement or preparation has started, cancellations may not be possible.
          Contact support as soon as possible if you need to cancel.
        </p>
      </LegalSection>

      <LegalSection title="Missing, incorrect, or damaged items">
        <p>
          If an item is missing, incorrect, or damaged, submit a photo and brief description through
          the app or by contacting support within 30 minutes of delivery. Eligible cases may receive
          store credit or a full/partial refund at our discretion after review.
        </p>
      </LegalSection>

      <LegalSection title="Payment failures & duplicate charges">
        <p>
          If payment fails, the order is not confirmed. If you are charged more than once for the
          same order, contact support with the payment reference; we will investigate with Razorpay
          and refund duplicates that are verified.
        </p>
      </LegalSection>

      <LegalSection title="Refund method & timeline">
        <p>
          Approved refunds are initiated to the original payment method via Razorpay. Bank or UPI
          timelines vary; most refunds appear within 5–7 business days after initiation, subject to
          your bank or wallet provider.
        </p>
      </LegalSection>

      <LegalSection title="Non-refundable cases">
        <p>
          Refunds may be declined for issues reported after the window above without reasonable
          cause, taste preference alone after delivery, or misuse of the platform. Parcel and custom
          requests may have different handling when the underlying purchase cannot be reversed.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Email{' '}
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
