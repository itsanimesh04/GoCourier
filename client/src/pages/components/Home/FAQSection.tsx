import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface FAQItem {
  id: number;
  question: string;
  answer: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "WHAT DO YOU OFFER?",
    answer: (
      <>
        We offer a wide variety of meals, fast food, beverages, and combo deals across top campus kitchens. You can also build your own customized meal box with your favorite dishes via <span className="cursor-pointer font-semibold text-fg underline">GoCourier Food Express</span>.
      </>
    ),
  },
  {
    id: 2,
    question: "WHAT IF I ENTER THE WRONG DELIVERY ADDRESS?",
    answer: "If you entered an incorrect delivery address, please contact our support team or chat with us on WhatsApp immediately before the courier rider picks up your order.",
  },
  {
    id: 3,
    question: "ARE YOUR MEALS DELIVERED FRESH & HOT?",
    answer: "Yes! All meals are freshly prepared by our partner kitchens upon receiving your order and delivered in insulated thermal bags to maintain maximum freshness and temperature.",
  },
  {
    id: 4,
    question: "HOW DO I CONTACT CUSTOMER SUPPORT?",
    answer: "You can reach our 24/7 customer support team via the in-app live chat, email us directly, or WhatsApp us anytime for instant order assistance.",
  },
  {
    id: 5,
    question: "DO YOU HAVE BULK OR GROUP ORDER OFFERS?",
    answer: "Yes, we offer special discounts and catered meal boxes for campus events, party orders, and bulk group bookings. Contact us on WhatsApp for custom pricing.",
  },
  {
    id: 6,
    question: "HOW LONG DOES DELIVERY TAKE?",
    answer: "Standard delivery times range between 25 to 35 minutes depending on your location on campus and peak kitchen traffic hours.",
  },
  {
    id: 7,
    question: "HOW CAN I TRACK MY ORDER?",
    answer: "Once your order is confirmed, you can track your driver in real-time through the order tracking screen on our mobile app or web portal.",
  },
  {
    id: 8,
    question: "DO YOU OFFER FREE DELIVERY?",
    answer: "We offer free express delivery on all orders above $20, as well as for all subscribers of our GoCourier Express Membership.",
  },
  {
    id: 9,
    question: "WHAT IS YOUR REFUND OR REPLACEMENT POLICY?",
    answer: "If an item is missing or damaged, simply submit a photo through the app within 30 minutes of delivery for an instant store credit or full refund.",
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="w-full py-8 text-fg sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <h2 className="text-center font-display text-xl font-bold text-fg sm:text-2xl">
          FAQS
        </h2>

        <div className="mx-auto mt-2 max-w-2xl text-center font-sans text-xs leading-relaxed text-muted sm:text-sm">
          <p>Curiosity didn’t kill the cat - it just brought you here!</p>
          <p>You got questions. We’ve got answers. If anything else pops up, WhatsApp us anytime.</p>
        </div>

        <div className="mx-auto mt-6 max-w-3xl border-t border-border">
          {faqData.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div key={item.id} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleFAQ(item.id)}
                  className="group flex w-full items-center justify-between py-3 text-left focus:outline-none"
                >
                  <span className="font-display text-sm font-semibold leading-snug text-fg sm:text-base">
                    {item.question}
                  </span>
                  <span className="ml-4 shrink-0 text-primary">
                    {isOpen ? (
                      <FiChevronUp className="h-5 w-5 stroke-[4.5]" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 stroke-[4.5]" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-5 pt-1 font-sans text-sm leading-relaxed text-muted">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FAQSection;
