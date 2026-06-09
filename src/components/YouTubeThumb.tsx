"use client";

import { useState } from "react";

/**
 * YouTube thumbnail with graceful fallback. Not every video has a
 * maxresdefault.jpg — when it 404s, swap to hqdefault.jpg, which always exists.
 * Raw <img> is intentional here: remote thumbs with an onError fallback are
 * simpler and cheaper than next/image for this case.
 */
export function YouTubeThumb({
  videoId,
  alt = "",
  className = "",
}: {
  videoId: string;
  alt?: string;
  className?: string;
}) {
  const [quality, setQuality] = useState<"maxresdefault" | "hqdefault">(
    "maxresdefault",
  );

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://img.youtube.com/vi/${videoId}/${quality}.jpg`}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (quality !== "hqdefault") setQuality("hqdefault");
      }}
      className={className}
    />
  );
}
