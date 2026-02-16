"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCloakroomStore } from "../store/cloakroomStore";

export default function CheckOutPage() {
  const items = useCloakroomStore((s) => s.items);
  const openItem = useCloakroomStore((s) => s.openItem);
  const closeItem = useCloakroomStore((s) => s.closeItem);

  const [wristband, setWristband] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const normalizedInput = useMemo(() => wristband.trim(), [wristband]);

  const findItem = (code: string) => items.find((it) => it.code === code);

  const handleOpen = () => {
    const code = normalizedInput;
    if (!code) {
      setMessage("Please scan a wristband first.");
      return;
    }

    const item = findItem(code);
    if (!item) {
      setMessage(`Not found: ${code}`);
      return;
    }

    if (item.status === "CLOSED") {
      setMessage(`Already CLOSED: ${code}`);
      return;
    }

    openItem(code);
    setWristband("");
    setMessage(`Locker opened: ${code}`);
  };

  const handleFinalReturn = () => {
    const code = normalizedInput;
    if (!code) {
      setMessage("Please scan a wristband first.");
      return;
    }

    const item = findItem(code);
    if (!item) {
      setMessage(`Not found: ${code}`);
      return;
    }

    if (item.status === "CLOSED") {
      setMessage(`Already CLOSED: ${code}`);
      return;
    }

    closeItem(code);
    setWristband("");
    setMessage(`Final return (CLOSED): ${code}`);
  };

  // pokazivaem tolko aktivnye (ne CLOSED)
  const activeItems = useMemo(
    () => items.filter((it) => it.status !== "CLOSED"),
    [items]
  );

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "16px",
      }}
    >
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>Check Out / Lockers</h1>

      <input
        placeholder="Scan wristband..."
        value={wristband}
        onChange={(e) => setWristband(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleFinalReturn();
        }}
        style={{
          width: "280px",
          padding: "12px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          outline: "none",
        }}
      />

      <button
        type="button"
        onClick={handleOpen}
        style={{
          width: "300px",
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "10px",
          background: "white",
          color: "#111",
          border: "1px solid #111",
          cursor: "pointer",
        }}
      >
        Open Locker (re-entry)
      </button>

      <button
        type="button"
        onClick={handleFinalReturn}
        style={{
          width: "300px",
          padding: "12px 20px",
          fontSize: "16px",
          borderRadius: "10px",
          background: "black",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Final Return (Close)
      </button>

      {message && (
        <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 24, width: 360 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          Active Items (not closed):
        </h2>

        {activeItems.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No active items.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {activeItems.map((item) => (
              <li
                key={item.code}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>#{item.code}</span>
                <span style={{ opacity: 0.7, fontSize: 13 }}>
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/"
        style={{
          marginTop: 18,
          textDecoration: "none",
          color: "#111",
          opacity: 0.8,
        }}
      >
        ← Back to Home
      </Link>
    </main>
  );
}
