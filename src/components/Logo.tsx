import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="SpikeReport home"
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12"
          aria-hidden="true"
        >
          <path
            d="M16 1.5 L24 8 V20 L16 30.5 L8 20 V8 Z"
            stroke="#27dabd"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className="opacity-70"
          />
          <path d="M16 7 L20 11 L16 23 L12 11 Z" fill="#27dabd" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Spike<span className="text-accent">Report</span>
      </span>
    </Link>
  );
}
