"use client";

import { useState } from "react";
import type { Clip } from "@/lib/types";
import { ClipCard } from "./ClipCard";
import { ClipModal } from "./ClipModal";

/** A responsive grid of clip cards that opens a clip in a modal player on click. */
export function ClipGrid({ clips }: { clips: Clip[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((clip, i) => (
          <ClipCard key={clip.id} clip={clip} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>
      {openIndex !== null && (
        <ClipModal
          clips={clips}
          index={openIndex}
          onNavigate={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
