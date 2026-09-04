import { LegalPage, LegalSection } from '../components/LegalPage';

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        These Terms & Conditions govern your use of GoCourier Private Limited’s website, mobile
        apps, and campus batch delivery services. By creating an account or placing an order, you
        agree to these terms.
      </p>

      <LegalSection title="Service description">
        <p>
          GoCourier aggregates campus food, extras, custom requests, and parcel pickup/drop for
          batch delivery to designated campus points. Availability, cutoff times, and delivery
          windows depend on campus schedules and partner restaurants.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          You must provide accurate information and keep your login details secure. You are
          responsible for activity under your account. We may suspend accounts that misuse the
          platform, attempt fraud, or violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="Orders & pricing">
        <p>
          Prices shown at checkout (including selected size/portion options and add-ons) are the
          amounts charged, plus any disclosed delivery or service fees. Placing an order constitutes
          an offer; we may cancel or partially fulfill if items are unavailable and will process
          refunds according to our Refund Policy.
        </p>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Payments are processed through Razorpay. Successful payment authorization is required
          before we confirm an order for procurement and delivery. Failed or incomplete payments may
          cancel the order.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not use GoCourier for illegal goods, harassment, scraping, reverse engineering, or
          interference with our systems or other users. Parcel and custom-request services must
          comply with applicable law and campus rules.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, GoCourier is not liable for indirect or
          consequential losses, delays caused by campus access restrictions, partner kitchen delays,
          or circumstances beyond our reasonable control. Our total liability for an order is
          limited to the amount you paid for that order.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms from time to time. Continued use after changes are posted
          constitutes acceptance of the updated terms.
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
