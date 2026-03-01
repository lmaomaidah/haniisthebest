import { useEffect, useState } from "react";

export function HackedOverlay() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    console.log("%c> You've been hacked (jk but not really)", "color: #ff0000; font-size: 16px; font-family: monospace;");
    console.log("%c> CHAOS HUSTLERS OWN THIS", "color: #ff0000; font-size: 14px; font-family: monospace;");
    console.log("%c> lol get rekt", "color: #ff4444; font-size: 12px; font-family: monospace;");
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Watermark */}
      <div className="hacked-watermark">HACKED</div>

      {/* PWNED corners */}
      <div className="pwned-corner" style={{ top: 12, left: 12 }}>🚩 PWNED</div>
      <div className="pwned-corner" style={{ top: 12, right: 12 }}>🚩 PWNED</div>
      <div className="pwned-corner" style={{ bottom: 12, left: 12 }}>🚩 PWNED</div>
      <div className="pwned-corner" style={{ bottom: 12, right: 12 }}>🚩 PWNED</div>

      {/* Bottom ticker */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#000",
          borderTop: "2px solid #ff0000",
          color: "#ff0000",
          textAlign: "center",
          padding: "6px 0",
          fontSize: "0.85rem",
          fontFamily: "'Courier New', monospace",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        🔴 SYSTEM COMPROMISED | Chaos Hustlers Own This
      </div>

      {/* Mouse cursor follower */}
      <div
        style={{
          position: "fixed",
          left: cursorPos.x + 16,
          top: cursorPos.y - 10,
          color: "#ff0000",
          fontSize: "1.5rem",
          fontFamily: "'Courier New', monospace",
          fontWeight: 900,
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          textShadow: "0 0 8px #ff0000, 0 0 16px #ff0000",
          transition: "opacity 0.1s",
        }}
      >
        ▌
      </div>
    </>
  );
}
