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
  // ✅ hooks snachala
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

  // ✅ tolko posle hooks
  if (!ready) return null;

  return (
    <div className="container">
      <main className="card" style={{ width: "min(900px, 100%)" }}>
        <h1 className="h1" style={{ textAlign: "center" }}>
          History
        </h1>
        <div className="sub" style={{ textAlign: "center" }}>
          Kept for <b>90 days</b>. Showing last <b>{events.length}</b> events (newest first).
        </div>

        {/* NAV */}
        <div className="row" style={{ marginTop: 14, justifyContent: "center" }}>
          <Link href="/checkin" className="btnSecondary" style={{ textAlign: "center" }}>
            ← Check In
          </Link>
          <Link href="/checkout" className="btnSecondary" style={{ textAlign: "center" }}>
            Check Out →
          </Link>
          <Link href="/" className="btnSecondary" style={{ textAlign: "center" }}>
            Home
          </Link>
        </div>

        {/* ACTIONS */}
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear history?")) clearHistory();
            }}
            className="btnSecondary"
          >
            Clear history
          </button>
        </div>

        {/* LIST */}
        <div style={{ marginTop: 18 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 24, opacity: 0.7 }}>
              No history yet.
            </div>
          ) : (
            <div className="list" style={{ marginTop: 8 }}>
              {events.map((e) => (
                <div key={e.id} className="listItem" style={{ padding: "14px 0" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>
                      #{e.code} — Checked {e.action}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
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
    </div>
  );
}
