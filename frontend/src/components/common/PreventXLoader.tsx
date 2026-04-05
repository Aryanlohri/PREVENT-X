import { useEffect, useState } from "react";

interface PreventXLoaderProps {
  onComplete?: () => void;
}

export default function PreventXLoader({ onComplete }: PreventXLoaderProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Match total animation duration — "READY" appears at 4.6s + 0.5s fade = 5.1s
    const timer = setTimeout(() => {
      setDone(true);
      onComplete?.();
    }, 5400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (done) return null;

  return (
    <div style={styles.root}>
      <div style={styles.cornerTL} className="px-corner" />
      <div style={styles.cornerBR} className="px-corner" />

      <div style={styles.logoWrap} className="px-logo-wrap">
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .px-shield {
              stroke-dasharray: 220;
              stroke-dashoffset: 220;
              animation: pxDrawShield 1s cubic-bezier(0.4,0,0.2,1) 0.8s forwards;
            }
            .px-pulse {
              stroke-dasharray: 130;
              stroke-dashoffset: 130;
              animation: pxDrawPulse 0.9s cubic-bezier(0.4,0,0.2,1) 1.5s forwards;
            }
            @keyframes pxDrawShield {
              to { stroke-dashoffset: 0; }
            }
            @keyframes pxDrawPulse {
              to { stroke-dashoffset: 0; }
            }
          `}</style>

          <path
            className="px-shield"
            d="M36 8 L14 19 L14 42 Q14 58 36 66 Q58 58 58 42 L58 19 Z"
            stroke="#4ade80"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polyline
            className="px-pulse"
            points="20,37 27,37 31,26 35,48 39,32 43,37 52,37"
            stroke="#4ade80"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p style={styles.wordmark} className="px-wordmark">
          Prevent<span style={styles.x}>X</span>
        </p>
        <p style={styles.tagline} className="px-tagline">HEALTH COMPANION</p>

        <div style={styles.barWrap} className="px-bar-wrap">
          <div style={styles.barFill} className="px-bar-fill" />
        </div>

        <p style={styles.ready} className="px-ready">READY</p>
      </div>

      <style>{`
        @keyframes pxRise {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pxFade {
          to { opacity: 1; }
        }
        @keyframes pxLoad {
          0%   { width: 0%; }
          60%  { width: 75%; }
          100% { width: 100%; }
        }

        .px-logo-wrap {
          opacity: 0;
          transform: translateY(10px);
          animation: pxRise 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s forwards;
        }
        .px-wordmark {
          opacity: 0;
          animation: pxFade 0.6s ease 2s forwards;
        }
        .px-tagline {
          opacity: 0;
          animation: pxFade 0.6s ease 2.3s forwards;
        }
        .px-bar-wrap {
          opacity: 0;
          animation: pxFade 0.4s ease 2.5s forwards;
        }
        .px-bar-fill {
          width: 0%;
          animation: pxLoad 1.8s cubic-bezier(0.4,0,0.2,1) 2.6s forwards;
        }
        .px-ready {
          opacity: 0;
          animation: pxFade 0.5s ease 4.6s forwards;
        }
        .px-corner {
          opacity: 0;
          animation: pxFade 0.5s ease 0.5s forwards;
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  cornerTL: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 18,
    height: 18,
    borderTop: "1px solid #e5e7eb",
    borderLeft: "1px solid #e5e7eb",
  },

  cornerBR: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 18,
    height: 18,
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #e5e7eb",
  },

  logoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },

  wordmark: {
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
    fontSize: 26,
    fontWeight: 600,
    color: "#111827",
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 0,
  },

  x: {
    color: "#4ade80",
  },

  tagline: {
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
    fontSize: 10,
    fontWeight: 400,
    color: "#6b7280",
    letterSpacing: 3,
    marginTop: 6,
    marginBottom: 0,
  },

  barWrap: {
    marginTop: 48,
    width: 120,
    height: 1,
    background: "#f3f4f6",
    position: "relative",
  },

  barFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 1,
    background: "#4ade80",
  },

  ready: {
    fontFamily: "Inter, -apple-system, system-ui, sans-serif",
    fontSize: 10,
    color: "#4ade80",
    letterSpacing: 2,
    marginTop: 14,
    marginBottom: 0,
  },
};
