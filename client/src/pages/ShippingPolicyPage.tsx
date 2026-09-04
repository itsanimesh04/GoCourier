import { LegalPage, LegalSection } from '../components/LegalPage';

export default function ShippingPolicyPage() {
  return (
    <LegalPage title="Delivery / Shipping Policy">
      <p>
        GoCourier Private Limited provides campus batch delivery rather than continuous on-demand
        courier. This policy explains how delivery works for food, extras, custom requests, and
        parcels.
      </p>

      <LegalSection title="Service area">
        <p>
          We deliver only to supported campuses and designated drop points shown in the app or
          website when you select your campus. We do not offer pan-India shipping of goods outside
          this campus delivery model.
        </p>
      </LegalSection>

      <LegalSection title="Order cutoff & delivery window">
        <p>
          Each campus has a cutoff time and a scheduled delivery window (for example, evening hostel
          batch). Orders placed after cutoff are queued for the next available batch unless
          otherwise stated in the product.
        </p>
      </LegalSection>

      <LegalSection title="Fees">
        <p>
          Delivery or service fees, if any, are shown at cart and checkout before you pay. Parcel
          and custom-request fees are disclosed when you create those requests.
        </p>
      </LegalSection>

      <LegalSection title="Handover">
        <p>
          Please be available at your selected drop point during the delivery window. If we cannot
          complete handover after reasonable attempts, we may reschedule for the next batch or
          contact you for instructions, subject to food safety and partner constraints.
        </p>
      </LegalSection>

      <LegalSection title="Delays">
        <p>
          Delays can occur due to restaurant prep times, traffic, campus access rules, weather, or
          high order volume. We will communicate material delays when possible through the app or
          support channels.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Delivery questions:{' '}
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
