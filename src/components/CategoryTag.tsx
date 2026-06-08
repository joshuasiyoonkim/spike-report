type Variant = "solid" | "subtle";

// Each category gets a distinct tint while staying within the dark editorial palette.
const STYLES: Record<string, { subtle: string; solid: string }> = {
  "Patch Notes": {
    subtle: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/25",
    solid: "bg-accent text-ink-950",
  },
  Roster: {
    subtle: "bg-sky-400/10 text-sky-300 ring-1 ring-inset ring-sky-400/25",
    solid: "bg-sky-400 text-ink-950",
  },
  Drama: {
    subtle: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/25",
    solid: "bg-rose-500 text-white",
  },
  Skins: {
    subtle: "bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/25",
    solid: "bg-violet-400 text-ink-950",
  },
  Guides: {
    subtle: "bg-amber-400/10 text-amber-300 ring-1 ring-inset ring-amber-400/25",
    solid: "bg-amber-400 text-ink-950",
  },
};

const FALLBACK = {
  subtle: "bg-slate-400/10 text-slate-300 ring-1 ring-inset ring-slate-400/25",
  solid: "bg-slate-300 text-ink-950",
};

export function CategoryTag({
  category,
  variant = "subtle",
  className = "",
}: {
  category: string;
  variant?: Variant;
  className?: string;
}) {
  const style = STYLES[category] ?? FALLBACK;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${style[variant]} ${className}`}
    >
      {category}
    </span>
  );
}

/** Accent gradient used for cover placeholders, keyed by category. */
export function categoryGradient(category: string): string {
  switch (category) {
    case "Patch Notes":
      return "from-accent/30 via-ink-800 to-ink-900";
    case "Roster":
      return "from-sky-500/25 via-ink-800 to-ink-900";
    case "Drama":
      return "from-rose-500/25 via-ink-800 to-ink-900";
    case "Skins":
      return "from-violet-500/25 via-ink-800 to-ink-900";
    case "Guides":
      return "from-amber-500/20 via-ink-800 to-ink-900";
    default:
      return "from-slate-500/20 via-ink-800 to-ink-900";
  }
}
