"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCloakroomStore } from "../store/cloakroomStore";

export default function CheckOutPage() {
  const [wristband, setWristband] = useState("");
  const [msg, setMsg] = useState<string>("");

  const items = useCloakroomStore((s) => s.items);
  const checkOut = useCloakroomStore((s) => s.checkOut);

  const inItems = useMemo(() => items.filter((it) => it.status === "IN"), [items]);

  const doCheckOut = (raw: string) => {
    const code = raw.trim();
    if (!code) return;

    const res = checkOut(code);

    if (res.ok) setMsg(`Checked out: ${code}`);
    else if (res.reason === "NOT_FOUND") setMsg("Not found");
    else if (res.reason === "ALREADY_OUT") setMsg("Already checked out");
    else setMsg("Error");

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
      <h1 style={{ fontSize: 36, fontWeight: 700 }}>Check Out Item</h1>

      <input
        placeholder="Scan wristband..."
        value={wristband}
        onChange={(e) => setWristband(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") doCheckOut(wristband);
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

      <button
        type="button"
        onClick={() => doCheckOut(wristband)}
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
        Confirm Check Out
      </button>

      {msg && <div style={{ opacity: 0.8 }}>{msg}</div>}

      <div style={{ marginTop: 20, width: 360 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
          Checked In Items:
        </h2>

        {inItems.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No checked-in items.</div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {inItems.map((item) => (
              <li
                key={item.code}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  fontSize: 16,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>#{item.code}</span>
                <span style={{ opacity: 0.7, fontSize: 13 }}>{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/" style={{ textDecoration: "none", color: "#111", marginTop: 10 }}>
        ← Back to Home
      </Link>
    </main>
  );
}
