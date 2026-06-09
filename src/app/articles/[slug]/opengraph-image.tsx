import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/articles";
import { formatDate } from "@/lib/format";

export const alt = "SpikeReport article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Accent color per category, mirroring CategoryTag.tsx.
const CATEGORY_COLORS: Record<string, string> = {
  "Patch Notes": "#27dabd",
  "Pro Scene": "#34d399",
  Roster: "#38bdf8",
  Drama: "#fb7185",
  "Skin Review": "#a78bfa",
  Gameplay: "#fbbf24",
  Opinion: "#fb923c",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  const title = article?.title ?? "SpikeReport";
  const category = article?.category ?? "";
  const accent = CATEGORY_COLORS[category] ?? "#27dabd";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#0a0c0f",
          backgroundImage: `radial-gradient(800px 500px at 80% 0%, ${accent}2e, transparent 60%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <path d="M16 3 L24 11 L16 29 L8 11 Z" fill="#27dabd" />
          </svg>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            SpikeReport
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {category && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                fontSize: "26px",
                fontWeight: 600,
                color: accent,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "24px",
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 60 ? "56px" : "68px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: "1040px",
            }}
          >
            {title}
          </div>
          {article && (
            <div
              style={{
                display: "flex",
                marginTop: "36px",
                fontSize: "28px",
                color: "#94a3b8",
              }}
            >
              {article.author} · {formatDate(article.date)} ·{" "}
              {article.readingTime} min read
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
