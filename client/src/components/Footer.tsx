import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';

export const Footer = () => {
  return (
    <footer className="w-full bg-primary px-4 py-10 font-sans text-on-primary sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 text-center">
        <div>
          <Link
            to="/"
            className="font-display text-xl font-bold tracking-tight sm:text-2xl"
          >
            GoCourier
          </Link>
          <p className="mt-1.5 max-w-md font-sans text-sm text-on-primary/85">
            Campus batch delivery — food, extras, and parcels to your campus gate.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium">
          <Link to="/food" className="hover:opacity-80">
            Food
          </Link>
          <Link to="/extras" className="hover:opacity-80">
            Extras
          </Link>
          <Link to="/extras/custom-request" className="hover:opacity-80">
            Custom request
          </Link>
          <Link to="/cart" className="hover:opacity-80">
            Cart
          </Link>
          <Link to="/profile" className="hover:opacity-80">
            Profile
          </Link>
          <a href="/#faq" className="hover:opacity-80">
            FAQ
          </a>
          <Link to="/login" className="hover:opacity-80">
            Login
          </Link>
        </nav>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-on-primary/90">
          <Link to="/privacy" className="hover:opacity-80">
            Privacy
          </Link>
          <Link to="/terms" className="hover:opacity-80">
            Terms
          </Link>
          <Link to="/refund-policy" className="hover:opacity-80">
            Refunds
          </Link>
          <Link to="/shipping-policy" className="hover:opacity-80">
            Delivery
          </Link>
          <Link to="/contact" className="hover:opacity-80">
            Contact
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-2 text-sm text-on-primary/90">
          <a
            href="https://wa.me/919606081463"
            className="inline-flex items-center gap-2 hover:opacity-80"
          >
            <FaWhatsapp size={18} />
            +91 9606081463
          </a>
          <a
            href="mailto:support@gocourier.com"
            className="hover:underline hover:opacity-80"
          >
            support@gocourier.com
          </a>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://wa.me/919606081463"
            aria-label="WhatsApp"
            className="transition-opacity hover:opacity-80"
          >
            <FaWhatsapp size={22} />
          </a>
          <a href="#instagram" aria-label="Instagram" className="transition-opacity hover:opacity-80">
            <FaInstagram size={22} />
          </a>
          <a href="#linkedin" aria-label="LinkedIn" className="transition-opacity hover:opacity-80">
            <FaLinkedinIn size={22} />
          </a>
        </div>

        <p className="border-t border-on-primary/20 pt-5 text-xs text-on-primary/75">
          © 2026 GoCourier Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
