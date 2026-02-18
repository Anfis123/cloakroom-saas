"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

type BackupQRModalProps = {
  code: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function BackupQRModal({
  code,
  isOpen,
  onClose,
}: BackupQRModalProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const backupUrl = useMemo(() => {
    if (!code) return "";
    return `${origin}/b/${encodeURIComponent(code)}`;
  }, [origin, code]);

  if (!isOpen || !code) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "min(520px, 100%)",
          padding: 0,
          overflow: "hidden",
          color: "white",
        }}
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
          <strong>Backup QR for guest phone</strong>
          <button
            type="button"
            onClick={onClose}
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
              <div style={{ background: "white", borderRadius: 14, padding: 12 }}>
                <QRCodeCanvas value={backupUrl || code} size={220} includeMargin />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Guest scans this once → gets their QR page
              </div>

              <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>
                #{code}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  opacity: 0.9,
                  wordBreak: "break-all",
                  border: "1px dashed rgba(255,255,255,0.18)",
                  borderRadius: 10,
                  padding: 10,
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                {backupUrl}
              </div>

              <Link
                href={`/b/${encodeURIComponent(code)}`}
                onClick={onClose}
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

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
                Tip: "Add to Home Screen" on phone.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
