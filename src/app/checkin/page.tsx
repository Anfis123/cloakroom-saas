"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRScanner from "../components/QRScanner";
import { useCloakroomStore } from "../store/cloakroomStore";
import { QRCodeCanvas } from "qrcode.react";

export default function CheckInPage() {
  const [wristband, setWristband] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // ✅ backup modal
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // чтобы QR в модалке был полноценной ссылкой (работает и на Vercel)
    setOrigin(window.location.origin);
  }, []);

  const items = useCloakroomStore((s) => s.items);
  const checkIn = useCloakroomStore((s) => s.checkIn);

  const backupUrl = useMemo(() => {
    if (!lastCode) return "";
    // ссылка на страницу дубля
    return `${origin}/b/${encodeURIComponent(lastCode)}`;
  }, [origin, lastCode]);

  const doCheckIn = (raw: string) => {
    const code = raw.trim();
    if (!code) return;

    checkIn(code);
    setWristband("");

    // ✅ после чек-ина показываем backup QR
    setLastCode(code);
    setShowBackup(true);
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

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <Link href="/checkout" style={{ textDecoration: "none", color: "#111" }}>
          Go to Check Out →
        </Link>
        <Link href="/" style={{ textDecoration: "none", color: "#111" }}>
          ← Back to Home
        </Link>
      </div>

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
            // ✅ сразу чек-ин после скана
            doCheckIn(text);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* ✅ BACKUP QR MODAL */}
      {showBackup && lastCode && (
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
            style={{
              width: "min(520px, 100%)",
              background: "white",
              borderRadius: 12,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>Backup QR for guest phone</strong>
              <button
                type="button"
                onClick={() => setShowBackup(false)}
                style={{
                  border: "1px solid #ddd",
                  background: "white",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <div
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <QRCodeCanvas value={backupUrl || lastCode} size={220} includeMargin />
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontSize: 13, opacity: 0.75 }}>
                    Guest scans this once → gets their QR page
                  </div>

                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>
                    #{lastCode}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      opacity: 0.8,
                      wordBreak: "break-all",
                      border: "1px dashed #ddd",
                      borderRadius: 10,
                      padding: 10,
                    }}
                  >
                    {backupUrl}
                  </div>

                  <a
                    href={`/b/${encodeURIComponent(lastCode)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 10,
                      textDecoration: "none",
                      border: "1px solid #111",
                      borderRadius: 10,
                      padding: "10px 12px",
                      color: "#111",
                      fontSize: 14,
                    }}
                  >
                    Open backup page →
                  </a>

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
  );
}
