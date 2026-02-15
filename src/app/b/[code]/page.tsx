"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

export default function BackupQRPage() {
  const params = useParams();
  const code = useMemo(() => {
    const raw = params?.code;
    return typeof raw === "string" ? decodeURIComponent(raw) : "";
  }, [params]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
              Your Backup QR
            </h1>
            <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
              Keep this open or “Add to Home Screen”.
            </div>
          </div>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontSize: 14,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              color: "#111",
              height: "fit-content",
            }}
          >
            Home
          </Link>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 12,
              border: "1px solid #eee",
            }}
          >
            <QRCodeCanvas value={code || "EMPTY"} size={220} includeMargin />
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Code</div>
            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              {code ? `#${code}` : "—"}
            </div>

            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
              If you lost the wristband, show this QR to the staff.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
