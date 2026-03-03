import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "linear-gradient(135deg, #f4f7f4 0%, #e4efe5 42%, #d4ead7 100%)",
          color: "#0f172a",
          display: "flex",
          height: "100%",
          width: "100%",
          fontFamily: "serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            border: "2px solid rgba(22, 101, 52, 0.14)",
            borderRadius: "36px",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            padding: "48px",
            position: "relative",
          }}
        >
          <div
            style={{
              alignItems: "center",
              color: "#166534",
              display: "flex",
              fontFamily: "sans-serif",
              fontSize: 30,
              fontWeight: 700,
              gap: "16px",
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "#166534",
                borderRadius: "20px",
                color: "#ffffff",
                display: "flex",
                fontSize: 32,
                fontWeight: 800,
                height: "64px",
                justifyContent: "center",
                width: "64px",
              }}
            >
              P
            </div>
            <span>Peck</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "760px",
            }}
          >
            <div
              style={{
                color: "#166534",
                display: "flex",
                fontFamily: "sans-serif",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Woodpecker Method
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 74,
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Train tactical patterns until they are automatic.
            </div>
            <div
              style={{
                color: "#334155",
                display: "flex",
                fontFamily: "sans-serif",
                fontSize: 28,
                lineHeight: 1.35,
              }}
            >
              Free chess puzzle repetition cycles, analytics, streaks, and
              progress tracking built for deliberate improvement.
            </div>
          </div>

          <div
            style={{
              alignItems: "flex-end",
              display: "flex",
              gap: "18px",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  color: "#166534",
                  display: "flex",
                  fontFamily: "sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                1.5M+ puzzles
              </div>
              <div
                style={{
                  color: "#475569",
                  display: "flex",
                  fontFamily: "sans-serif",
                  fontSize: 20,
                }}
              >
                Faster cycles. Better recall. Stronger calculation.
              </div>
            </div>

            <div
              style={{
                alignItems: "center",
                background: "#166534",
                borderRadius: "999px",
                color: "#ffffff",
                display: "flex",
                fontFamily: "sans-serif",
                fontSize: 22,
                fontWeight: 700,
                padding: "16px 24px",
              }}
            >
              peckchess.com
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
