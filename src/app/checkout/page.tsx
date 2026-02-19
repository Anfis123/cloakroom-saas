// ✅ FILE: src/app/checkout/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRScanner from "../components/QRScanner";
import { useCloakroomStore } from "../store/cloakroomStore";
import { useIsAdmin, useRequireStaff } from "../utils/requireStaff";
import { isValidCode, normalizeCode } from "../utils/wristbandCode";
import { QRCodeCanvas } from "qrcode.react";

export default function CheckOutPage() {
  const ready = useRequireStaff();
  const isAdmin = useIsAdmin();

  const [wristband, setWristband] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lastCheckedOut, setLastCheckedOut] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ✅ backup modal (QR kartinka posle uspešnogo checkout)
  const [origin, setOrigin] = useState("");
  const [showBackup, setShowBackup] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const items = useCloakroomStore((s) => s.items);
  const checkOut = useCloakroomStore((s) => s.checkOut);
  const clearActiveItems = useCloakroomStore((s) => s.clearActiveItems);

  const backupUrl = useMemo(() => {
    if (!lastCheckedOut) return "";
    return `${origin}/b/${encodeURIComponent(lastCheckedOut)}`;
  }, [origin, lastCheckedOut]);

  const doCheckOut = (raw: string) => {
    setErr(null);

    const code = normalizeCode(raw);
    if (!code) return;

    if (!isValidCode(code)) {
      setErr("Invalid code. Format: WC-XXXXXXXX (8 symbols).");
      return;
    }

    checkOut(code);
    setWristband("");
    setLastCheckedOut(code);

    // ✅ otkryvaem QR modal posle uspešnogo checkout
    setShowBackup(true);
  };

  if (!ready) return null;

  return (
    <div className="container">
      <main className="card" style={{ width: "min(560px, 100%)" }}>
        <h1 className="h1">Check Out Item</h1>
        <div className="sub">Scan wristband QR, then confirm check-out.</div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Scan wristband..."
            value={wristband}
            onChange={(e) => setWristband(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") doCheckOut(wristband);
            }}
          />

          {err && (
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ff5a5a" }}>
              {err}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="btnSecondary"
          >
            Open Camera Scanner
          </button>

          <button
            type="button"
            onClick={() => doCheckOut(wristband)}
            className="btn"
          >
            Confirm Check Out
          </button>

          {lastCheckedOut && (
            <div style={{ marginTop: 4, fontSize: 14, opacity: 0.85 }}>
              Checked out: <b>{lastCheckedOut}</b>
            </div>
          )}

          <div className="row" style={{ marginTop: 6 }}>
            <Link href="/checkin" className="btnSecondary" style={{ textAlign: "center" }}>
              ← Check In
            </Link>
            <Link href="/" className="btnSecondary" style={{ textAlign: "center" }}>
              ← Back to Home
            </Link>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="btnSecondary"
              onClick={() => {
                if (confirm("ADMIN: Clear ALL active checked-in items?")) clearActiveItems();
              }}
            >
              ADMIN: Clear active items
            </button>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Checked In Items</div>
            <div className="badge">{items.length} active</div>
          </div>

          {items.length === 0 ? (
            <div style={{ marginTop: 10, opacity: 0.7 }}>No items yet.</div>
          ) : (
            <div className="list">
              {items.map((item) => (
                <div key={item.code} className="listItem">
                  <div style={{ fontWeight: 900 }}>{item.code}</div>
                  <div style={{ opacity: 0.7, fontSize: 13 }}>{item.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ QR SCANNER MODAL */}
        {showScanner && (
          <QRScanner
            onResult={(text) => {
              doCheckOut(text);
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}

        {/* ✅ BACKUP QR MODAL (kak v check-in) */}
        {showBackup && lastCheckedOut && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              zIndex: 10000,
            }}
            onClick={() => setShowBackup(false)}
          >
            <div
              className="card"
              style={{ width: "min(520px, 100%)", padding: 0, overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <strong>QR for guest / receipt</strong>
                <button
                  type="button"
                  onClick={() => setShowBackup(false)}
                  className="btnSecondary"
                  style={{ width: "auto" }}
                >
                  Close
                </button>
              </div>

              <div style={{ padding: 12 }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <div
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      padding: 10,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        borderRadius: 14,
                        padding: 12,
                      }}
                    >
                      <QRCodeCanvas value={backupUrl || lastCheckedOut} size={220} includeMargin />
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>
                      Guest scans this → opens backup page (/b/...)
                    </div>

                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>
                      {lastCheckedOut}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        opacity: 0.8,
                        wordBreak: "break-all",
                        border: "1px dashed rgba(255,255,255,0.18)",
                        borderRadius: 10,
                        padding: 10,
                        background: "rgba(0,0,0,0.25)",
                      }}
                    >
                      {backupUrl}
                    </div>

                    <Link
                      href={`/b/${encodeURIComponent(lastCheckedOut)}`}
                      onClick={() => setShowBackup(false)}
                      className="btn"
                      style={{
                        display: "inline-flex",
                        width: "auto",
                        marginTop: 10,
                        justifyContent: "center",
                        padding: "10px 12px",
                      }}
                    >
                      Open backup page →
                    </Link>

                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                      Tip: “Add to Home Screen” on phone.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
