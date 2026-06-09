import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/site";

export const alt = "SpikeReport — Valorant takes, rosters & clips";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0c0f",
          backgroundImage:
            "radial-gradient(800px 500px at 20% 0%, rgba(39, 218, 189, 0.18), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
            <path d="M16 3 L24 11 L16 29 L8 11 Z" fill="#27dabd" />
          </svg>
          <div
            style={{
              fontSize: "84px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            SpikeReport
          </div>
        </div>
        <div
          style={{
            marginTop: "32px",
            fontSize: "34px",
            color: "#94a3b8",
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  );
}
