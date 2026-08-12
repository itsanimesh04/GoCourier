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
    "Order before cutoff time for hostel drop tonight",
    "Campus dinners, delivered on time",
    "Student riders. Fair fees.",
    "We don't deliver inside the campus",
  ],
  separator = "•",
  bgColor = "bg-surface",
  textColor = "text-fg",
  speed = 20,
  direction = "left",
  className = "",
}) => {
  const content = items.map((text, idx) => (
    <React.Fragment key={idx}>
      <span className="inline-block">{text}</span>
      <span className="mx-4 inline-block opacity-70">{separator}</span>
    </React.Fragment>
  ));

  const animationDirection = direction === "left" ? "normal" : "reverse";

  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap py-2.5 font-display text-base font-semibold uppercase tracking-wider select-none ${
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
        <div className="flex shrink-0 items-center">{content}</div>
        <div className="flex shrink-0 items-center">{content}</div>
        <div className="flex shrink-0 items-center">{content}</div>
        <div className="flex shrink-0 items-center">{content}</div>
      </div>
    </div>
  );
};

export default InfiniteTextBanner;
