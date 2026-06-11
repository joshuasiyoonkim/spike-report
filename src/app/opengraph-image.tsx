import { ImageResponse } from "next/og";

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
          backgroundColor: "#080b0f",
          display: "flex",
          alignItems: "center",
          padding: "0 120px",
          position: "relative",
        }}
      >
        {/* left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 10,
            height: "100%",
            backgroundColor: "#27dabd",
          }}
        />

        {/* top hairline */}
        <div
          style={{
            position: "absolute",
            top: 70,
            left: 120,
            right: 120,
            height: 1,
            backgroundColor: "rgba(39,218,189,0.25)",
          }}
        />

        {/* bottom hairline */}
        <div
          style={{
            position: "absolute",
            bottom: 70,
            left: 120,
            right: 120,
            height: 1,
            backgroundColor: "rgba(39,218,189,0.25)",
          }}
        />

        {/* spike diamond */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 60,
            width: 90,
            height: 90,
            backgroundColor: "#27dabd",
            transform: "rotate(45deg)",
            borderRadius: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderBottom: "24px solid #080b0f",
              transform: "rotate(-45deg) translateY(-4px)",
            }}
          />
        </div>

        {/* text */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontSize: 120,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-4px",
                lineHeight: 1,
              }}
            >
              Spike
            </span>
            <span
              style={{
                fontSize: 120,
                fontWeight: 700,
                color: "#27dabd",
                letterSpacing: "-4px",
                lineHeight: 1,
              }}
            >
              Report
            </span>
          </div>
          <span
            style={{
              fontSize: 34,
              color: "#94a3b8",
              marginTop: 20,
              letterSpacing: "0.5px",
            }}
          >
            Valorant takes, rosters, drama, and clips.
          </span>
        </div>

        {/* VALORANT pill */}
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: 90,
            border: "1px solid #27dabd",
            borderRadius: 4,
            padding: "8px 20px",
            display: "flex",
          }}
        >
          <span
            style={{
              fontSize: 20,
              color: "#27dabd",
              letterSpacing: "4px",
              fontWeight: 500,
            }}
          >
            VALORANT
          </span>
        </div>
      </div>
    ),
    size,
  );
}
