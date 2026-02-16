"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useCloakroomStore } from "../store/cloakroomStore";
import { useRequireStaff } from "../utils/requireStaff";

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function HistoryPage() {
  const ready = useRequireStaff();

  const history = useCloakroomStore((s) => s.history);
  const cleanupHistory = useCloakroomStore((s) => s.cleanupHistory);
  const clearHistory = useCloakroomStore((s) => s.clearHistory);

  useEffect(() => {
    cleanupHistory(); // авто-чистка при заходе
  }, [cleanupHistory]);

  const events = useMemo(() => {
    const copy = [...history];
    copy.sort((a, b) => b.at - a.at);
    return copy;
  }, [history]);

  if (!ready) return null;

  return (
    <main style={{ minHeight: "100vh", padding: 28 }}>
      <h1 style={{ textAlign: "center", fontSize: 44, fontWeight: 900 }}>
        History
      </h1>

      <div style={{ textAlign: "center", marginTop: 10 }}>
        <Link href="/checkin" style={{ marginRight: 14, color: "#111", textDecoration: "none" }}>
          ← Check In
        </Link>
        <Link href="/checkout" style={{ marginRight: 14, color: "#111", textDecoration: "none" }}>
          Check Out →
        </Link>
        <Link href="/" style={{ color: "#111", textDecoration: "none" }}>
          Home
        </Link>
      </div>

      <div style={{ maxWidth: 820, margin: "18px auto 0", textAlign: "center", opacity: 0.75 }}>
        Kept for <b>90 days</b>. Showing last <b>{events.length}</b> events (newest first)
      </div>

      <div style={{ maxWidth: 820, margin: "14px auto 0", display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear history?")) clearHistory();
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "white",
            cursor: "pointer",
          }}
        >
          Clear history
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: "18px auto 0" }}>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 40, opacity: 0.7 }}>
            No history yet.
          </div>
        ) : (
          <div style={{ marginTop: 20 }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>
                    #{e.code} — Checked {e.action}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>
                    Staff: {e.staff || "staff"}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 13, opacity: 0.8 }}>
                  {fmt(e.at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
