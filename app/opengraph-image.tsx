import { ImageResponse } from "next/og";
import { TAGLINE } from "@/lib/public-site";

export const alt = "RoadSense — Community road hazard reporting for Malaysia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #009ee3 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#009ee3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em" }}>RoadSense</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Community road hazard reporting
          </div>
          <div style={{ fontSize: "30px", lineHeight: 1.35, color: "#e2e8f0" }}>{TAGLINE}</div>
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "22px", color: "#cbd5e1" }}>
          <span>Malaysia</span>
          <span>·</span>
          <span>Android app</span>
          <span>·</span>
          <span>UiTM ICT602</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
