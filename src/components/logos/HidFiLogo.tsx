interface HidFiLogoProps {
  className?: string;
  size?: number;
  /** Show the "HID-Fi" wordmark beside the tile */
  wordmark?: boolean;
}

// The HID-Fi mark (from the HID-Fi repo, docs/assets/logo.svg): a control dial with the
// pointer breaking out through its gap, on the brand's cyan-to-blue tile.
export function HidFiLogo({ className = "", size = 32, wordmark = false }: HidFiLogoProps) {
  const id = `hidfi-tile-${size}`;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 132 132" width={size} height={size} role="img" aria-label="HID-Fi">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d2ff" />
            <stop offset="1" stopColor="#3a7bd5" />
          </linearGradient>
        </defs>
        <rect width="132" height="132" rx="34" fill={`url(#${id})`} />
        <g
          transform="translate(19.8 19.8) scale(3.3)"
          fill="none"
          stroke="#04121a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.67 21.45A8.9 8.9 0 1 1 21.45 11.67" />
          <path d="M8.64 8.64 14.96 20.66 15.7 15.7 20.66 14.96Z" fill="#04121a" strokeWidth="1.5" />
        </g>
      </svg>
      {wordmark && (
        <span className="font-bold tracking-tight text-foreground" style={{ fontSize: size * 0.62 }}>
          HID-Fi
        </span>
      )}
    </span>
  );
}
