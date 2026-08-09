export const Logo = ({ color, width, height }: { color: "white" | "black"; width?: number; height?: number }) => {
  return (
    <svg
      width={width || 56}
      height={height || 59}
      viewBox="0 0 56 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.2557 43.7844H55.2919C55.3252 44.0609 55.3585 44.3375 55.3919 44.614L0.464069 58.5191L0 57.88L46.7496 0.00012207L47.4623 0.456834C39.5415 14.6334 31.6214 28.8092 23.2557 43.7844Z"
        fill={color}
      />
      <path
        d="M47.745 16.3721L56.0004 32.9631H39.6455C42.3395 27.4457 44.9069 22.1858 47.745 16.3721Z"
        fill={color}
      />
    </svg>
  );
};
