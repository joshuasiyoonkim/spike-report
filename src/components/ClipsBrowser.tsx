"use client";

import { useMemo, useState } from "react";
import type { Clip } from "@/lib/types";
import { ClipCard } from "./ClipCard";

export function ClipsBrowser({
  clips,
  tags,
}: {
  clips: Clip[];
  tags: string[];
}) {
  const [active, setActive] = useState<string>("All");

  const filters = useMemo(() => ["All", ...tags], [tags]);
  const visible = useMemo(
    () =>
      active === "All"
        ? clips
        : clips.filter((c) => c.tags?.includes(active)),
    [active, clips]
  );

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {filters.map((filter) => {
            const isActive = filter === active;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActive(filter)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-ink-950"
                    : "border border-ink-700 text-slate-300 hover:border-accent/50 hover:text-white"
                }`}
              >
                {filter === "All" ? "All" : `#${filter}`}
              </button>
            );
          })}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-slate-500">
          No clips with this tag yet.
        </p>
      )}
    </div>
  );
}
