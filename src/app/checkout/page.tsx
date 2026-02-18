"use client";

import { useState } from "react";
import Link from "next/link";
import QRScanner from "../components/QRScanner";
import { useCloakroomStore } from "../store/cloakroomStore";
import { useRequireStaff } from "../utils/requireStaff";

export default function CheckOutPage() {
  // ✅ hooks snachala
  const ready = useRequireStaff();

  const [wristband, setWristband] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [lastCheckedOut, setLastCheckedOut] = useState<string | null>(null);

  const items = useCloakroomStore((s) => s.items);
  const checkOut = useCloakroomStore((s) => s.checkOut);

  const doCheckOut = (raw: string) => {
    const code = raw.trim();
    if (!code) return;

    checkOut(code);
    setWristband("");
    setLastCheckedOut(code);
  };

  // ✅ tolko posle hooks
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

          {/* ✅ OPEN CAMERA SCANNER (kak v check-in) */}
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
              Checked out: <b>#{lastCheckedOut}</b>
            </div>
          )}

          <div className="row" style={{ marginTop: 6 }}>
            <Link
              href="/checkin"
              className="btnSecondary"
              style={{ textAlign: "center" }}
            >
              ← Check In
            </Link>
            <Link
              href="/"
              className="btnSecondary"
              style={{ textAlign: "center" }}
            >
              ← Back to Home
            </Link>
          </div>
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
                  <div style={{ fontWeight: 900 }}>#{item.code}</div>
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
              doCheckOut(text); // ✅ srazu check-out posle skana
              setShowScanner(false);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </main>
    </div>
  );
}
