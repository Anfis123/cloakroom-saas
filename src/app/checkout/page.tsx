"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCloakroomStore } from "../store/cloakroomStore";

export default function CheckOutPage() {
  const items = useCloakroomStore((s) => s.items);
  const checkOut = useCloakroomStore((s) => s.checkOut);

  const [wristband, setWristband] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const normalizedInput = useMemo(() => wristband.trim(), [wristband]);

  const handleCheckout = () => {
    const code = normalizedInput;
    if (!code) {
      setMessage("Please scan a wristband first.");
      return;
    }

    const exists = items.includes(code);
    if (!exists) {
      setMessage(`Not found: ${code}`);
      return;
    }

    checkOut(code); // удалит ОДНУ штуку (если store сделан правильно ниже)
    setWristband("");
    setMessage(`Checked out: ${code}`);
  };

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
      <h1 style={{ fontSize: "36px", fontWeight: 700 }}>Check Out Item</h1>

      <input
        placeholder="Scan wristband..."
        value={wristband}
        onChange={(e) => {
          setWristband(e.target.value);
          if (message) setMessage(null); // чтобы сообщение исчезало при новом вводе
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCheckout();
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
        onClick={handleCheckout}
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
        Confirm Check Out
      </button>

      {message && (
        <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.85 }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: "24px", width: "320px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "10px" }}>
          Checked In Items:
        </h2>

        {items.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No items yet.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {items.map((code, idx) => (
              <li
                key={`${code}-${idx}`} // ✅ теперь не ломается при повторах
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "16px",
                }}
              >
                #{code}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link
        href="/"
        style={{
          marginTop: "18px",
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
