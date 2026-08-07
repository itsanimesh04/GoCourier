import React from 'react';
import { 
  FiMail, 
  FiMapPin, 
  FiShare2, 
  FiInfo, 
  FiLink, 
  FiChevronDown 
} from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaLinkedinIn } from 'react-icons/fa6';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-primary text-white pt-12 pb-8 px-6 sm:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pb-12">
          
          {/* COLUMN 1: GET IN TOUCH & REACH US */}
          <div className="space-y-8">
            {/* Get In Touch */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiMail size={18} className="text-white" />
                <h3 className="font-bebas text-2xl tracking-wide leading-none">
                  GET IN TOUCH
                </h3>
              </div>
              
              <div className="space-y-2.5 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-1.5">
                  <FaWhatsapp size={15} />
                  <span>
                    Whatsapp: <a href="https://wa.me/919606081463" className="underline hover:opacity-80">+91 9606081463</a>
                  </span>
                </div>

                <p>
                  <span className="font-semibold">Support:</span>{' '}
                  <a href="mailto:support@gocourierservice.com" className="underline hover:opacity-80">
                    support@gocourierservice.com
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Bulk & Corporate Orders:</span>{' '}
                  <a href="mailto:bulkorders@gocourierservice.com" className="underline hover:opacity-80">
                    bulkorders@gocourierservice.com
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Restaurant Partnerships:</span>{' '}
                  <a href="mailto:partnerships@gocourierservice.com" className="underline hover:opacity-80">
                    partnerships@gocourierservice.com
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Delivery Fleet Careers:</span>{' '}
                  <a href="#careers" className="underline hover:opacity-80">
                    Apply Here
                  </a>
                </p>
              </div>
            </div>

            {/* Subtle Divider */}
            <hr className="border-white/20 my-6" />

            {/* Reach Us */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiMapPin size={18} className="text-white" />
                <h3 className="font-bebas text-2xl tracking-wide leading-none">
                  REACH US
                </h3>
              </div>
              
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-xs">
                3rd Floor, No. 616, 15th Main Rd, 4th Block,<br />
                Koramangala, Bengaluru, Karnataka 560034
              </p>
            </div>
          </div>


          {/* COLUMN 2: SOCIAL & ABOUT US */}
          <div className="space-y-8">
            {/* Social */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiShare2 size={18} className="text-white" />
                <h3 className="font-bebas text-2xl tracking-wide leading-none">
                  SOCIAL
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xl">
                <a href="#instagram" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                  <FaInstagram size={22} />
                </a>
                <a href="#linkedin" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
                  <FaLinkedinIn size={22} />
                </a>
              </div>
            </div>

            {/* Subtle Divider */}
            <hr className="border-white/20 my-6" />

            {/* About Us */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiInfo size={18} className="text-white" />
                <h3 className="font-bebas text-2xl tracking-wide leading-none">
                  ABOUT US
                </h3>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-white/90 font-medium">
                <li>
                  <a href="#about" className="hover:underline">ABOUT GOCOURIER</a>
                </li>
                <li>
                  <a href="#kitchen-lab" className="hover:underline">GOCOURIER KITCHEN LAB</a>
                </li>
                <li>
                  <a href="#vault" className="hover:underline">THE FOOD VAULT</a>
                </li>
                <li>
                  <a href="#express-hub" className="hover:underline">CAMPUS EXPRESS HUB</a>
                </li>
              </ul>
            </div>
          </div>


          {/* COLUMN 3: QUICK LINKS */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FiLink size={18} className="text-white" />
              <h3 className="font-bebas text-2xl tracking-wide leading-none">
                QUICK LINKS
              </h3>
            </div>

            <ul className="space-y-2 text-xs sm:text-sm text-white/90 font-medium">
              <li><a href="/" className="hover:underline">HOME</a></li>
              <li><a href="#restaurants" className="hover:underline">RESTAURANT LOCATOR</a></li>
              <li><a href="#live-tracking" className="hover:underline">LIVE ORDER TRACKING PORTAL</a></li>
              <li><a href="#contact" className="hover:underline">CONTACT US</a></li>
              <li><a href="#care" className="hover:underline">CUSTOMER CARE</a></li>
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
              <li><a href="#find-meal" className="hover:underline">FIND YOUR MEAL COMBO</a></li>
              <li><a href="#brand-assets" className="hover:underline">BRAND ASSETS</a></li>
              <li><a href="#tc" className="hover:underline">T&amp;C</a></li>
              <li><a href="#refund" className="hover:underline">CANCELLATION AND REFUND POLICY</a></li>
              <li><a href="#privacy" className="hover:underline">PRIVACY POLICY</a></li>
              <li><a href="#delivery-policy" className="hover:underline">EXPRESS DELIVERY POLICY</a></li>
            </ul>
          </div>

        </div>


        {/* BOTTOM SECTION: Country Selector & Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80">
          
          {/* Country Switcher */}
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80">
            <span role="img" aria-label="India Flag" className="text-base">🇮🇳</span>
            <span className="font-semibold text-white">India</span>
            <FiChevronDown size={14} />
          </div>

          {/* Copyright Notice */}
          <p className="text-center sm:text-right">
            © 2026, <a href="/" className="underline hover:text-white">GoCourierService Private Limited. All Rights Reserved.</a>
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;