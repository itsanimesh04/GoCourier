import React from "react";

interface InfiniteTextBannerProps {
  items?: string[];
  separator?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

export const InfiniteTextBanner: React.FC<InfiniteTextBannerProps> = ({
  items = [
    "❤️ SMELL IT, LOVE IT — OR GET 100% MONEY BACK.",
    "REDEEM YOUR DISCOVERY SET COST ON ANY FULL-SIZE BOTTLE.",
  ],
  separator = "•",
  bgColor = "bg-black",
  textColor = "text-white",
  speed = 20,
  direction = "left",
  className = "",
}) => {
  // Combine all messages into a single repeated string format
  const content = items.map((text, idx) => (
    <React.Fragment key={idx}>
      <span className="inline-block">{text}</span>
      <span className="mx-4 inline-block opacity-70">{separator}</span>
    </React.Fragment>
  ));

  // Handle custom dynamic CSS variables for speed and direction
  const animationDirection = direction === "left" ? "normal" : "reverse";

  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap py-2.5 font-bebas uppercase tracking-wider text-base select-none ${
        bgColor.startsWith("#") ? "" : bgColor
      } ${textColor.startsWith("#") ? "" : textColor} ${className}`}
      style={{
        backgroundColor: bgColor.startsWith("#") ? bgColor : undefined,
        color: textColor.startsWith("#") ? textColor : undefined,
      }}
    >
      <div
        className="inline-flex w-max animate-marquee"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: animationDirection,
        }}
      >
        {/* Render duplicate sets to ensure smooth seamless scrolling loop */}
        <div className="flex items-center shrink-0">{content}</div>
        <div className="flex items-center shrink-0">{content}</div>
        <div className="flex items-center shrink-0">{content}</div>
        <div className="flex items-center shrink-0">{content}</div>
      </div>
    </div>
  );
};

export default InfiniteTextBanner;