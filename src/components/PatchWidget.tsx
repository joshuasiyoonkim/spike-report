import Link from "next/link";
import type { PatchInfo } from "@/lib/homepage";

/** Small card with the current patch number and a one-line take. */
export function PatchWidget({ patch }: { patch: PatchInfo }) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Current patch
        </p>
        <span className="font-display text-2xl font-bold text-white">
          {patch.version}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        “{patch.take}”
      </p>
    </>
  );

  if (!patch.articleSlug) {
    return <div className="surface p-5">{body}</div>;
  }

  return (
    <Link
      href={`/articles/${patch.articleSlug}`}
      className="group surface block p-5 transition-colors hover:border-accent/40"
    >
      {body}
      <p className="mt-3 text-xs font-medium text-slate-500 transition-colors group-hover:text-accent">
        Read my take →
      </p>
    </Link>
  );
}
