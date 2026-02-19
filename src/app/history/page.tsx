"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useCloakroomStore } from "../store/cloakroomStore";
import { useIsAdmin, useRequireStaff } from "../utils/requireStaff";

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function HistoryPage() {
  const ready = useRequireStaff();
  const admin = useIsAdmin();

  const history = useCloakroomStore((s) => s.history);
  const cleanupHistory = useCloakroomStore((s) => s.cleanupHistory);
  const clearHistory = useCloakroomStore((s) => s.clearHistory);
  const clearActiveItems = useCloakroomStore((s) => s.clearActiveItems);

  useEffect(() => {
    cleanupHistory();
  }, [cleanupHistory]);

  const events = useMemo(() => {
    const copy = [...history];
    copy.sort((a, b) => b.at - a.at);
    return copy;
  }, [history]);

  if (!ready) return null;

  const pageBg =
    "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.22), rgba(0,0,0,0.96))";

  const card: React.CSSProperties = {
    width: "min(920px, 100%)",
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
    borderRadius: 18,
    backdropFilter: "blur(10px)",
    padding: 20,
  };

  const navBtn: React.CSSProperties = {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    textDecoration: "none",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 700,
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(8px)",
  };

  const clearBtn: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(8px)",
  };

  const adminRowBtn: React.CSSProperties = {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 10px 30px rgba(0,0,0,0.28)",
    backdropFilter: "blur(8px)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: pageBg,
        color: "white",
      }}
    >
      <section style={card}>
        <h1
          style={{
            textAlign: "center",
            fontSize: 48,
            fontWeight: 900,
            margin: 0,
            textShadow: "0 2px 18px rgba(0,0,0,0.7)",
          }}
        >
          History
        </h1>

        <div style={{ textAlign: "center", marginTop: 8, opacity: 0.85, fontSize: 13 }}>
          Kept for <b>90 days</b>. Showing last <b>{events.length}</b> events (newest first).
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Link href="/checkin" style={navBtn}>
            ← Check In
          </Link>

          <Link href="/checkout" style={navBtn}>
            Check Out →
          </Link>

          <Link href="/" style={navBtn}>
            Home
          </Link>
        </div>

        {/* ✅ ADMIN ONLY extra actions */}
        {admin && (
          <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              style={adminRowBtn}
              onClick={() => {
                if (confirm("ADMIN: Clear ALL history?")) clearHistory();
              }}
            >
              Admin: Clear history
            </button>

            <button
              type="button"
              style={adminRowBtn}
              onClick={() => {
                if (confirm("ADMIN: Clear ALL active checked-in items?")) clearActiveItems();
              }}
            >
              Admin: Clear checked-in
            </button>
          </div>
        )}

        {/* 👇 Esli hochesh chtoby staff NE mog clear history — obverni eto v {admin && (...)} */}
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear history?")) clearHistory();
            }}
            style={clearBtn}
          >
            Clear history
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          {events.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: 26, opacity: 0.75 }}>
              No history yet.
            </div>
          ) : (
            <div style={{ marginTop: 6 }}>
              {events.map((e) => (
                <div
                  key={e.id}
                  style={{
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        textShadow: "0 2px 14px rgba(0,0,0,0.55)",
                      }}
                    >
                      {e.code} — Checked {e.action}
                    </div>

                    <div style={{ fontSize: 13, opacity: 0.78 }}>
                      Staff: {e.staff || "staff"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", fontSize: 13, opacity: 0.85 }}>
                    {fmt(e.at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}