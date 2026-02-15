"use client";

import { useState } from "react";
import Link from "next/link";
import QRScanner from "../components/QRScanner";
import { useCloakroomStore } from "../store/cloakroomStore";

export default function CheckInPage() {
  const [wristband, setWristband] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const items = useCloakroomStore((s) => s.items);
  const checkIn = useCloakroomStore((s) => s.checkIn);

  const doCheckIn = (raw: string) => {
    const code = raw.trim();
    if (!code) return;

    checkIn(code);
    setWristband("");
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>Check In Item</h1>

      <input
        placeholder="Scan wristband..."
        value={wristband}
        onChange={(e) => setWristband(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") doCheckIn(wristband);
        }}
        style={{
          width: 280,
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
          outline: "none",
        }}
      />

      {/* OPEN CAMERA BUTTON */}
      <button
        type="button"
        onClick={() => setShowScanner(true)}
        style={{
          width: 300,
          padding: "10px 14px",
          fontSize: 14,
          borderRadius: 10,
          background: "white",
          border: "1px solid #111",
          cursor: "pointer",
        }}
      >
        Open Camera Scanner
      </button>

      <button
        type="button"
        onClick={() => doCheckIn(wristband)}
        style={{
          width: 300,
          padding: "12px 20px",
          fontSize: 16,
          borderRadius: 10,
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Confirm Check In
      </button>

      {/* LINKS */}
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <Link href="/checkout" style={{ textDecoration: "none", color: "#111" }}>
          Go to Check Out →
        </Link>
        <Link href="/" style={{ textDecoration: "none", color: "#111" }}>
          ← Back to Home
        </Link>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 30, width: 320 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          Checked In Items:
        </h2>

        {items.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No items yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((code, i) => (
              <li
                key={`${code}-${i}`}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: 16,
                }}
              >
                #{code}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* QR SCANNER MODAL */}
      {showScanner && (
        <QRScanner
          onResult={(text) => {
            // ✅ РЕКОМЕНДУЮ: сразу делать чек-ин после скана
            doCheckIn(text);

            // Если хочешь только заполнить поле, замени строку выше на:
            // setWristband(text);

            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </main>
  );
}
