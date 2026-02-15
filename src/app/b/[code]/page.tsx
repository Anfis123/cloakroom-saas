"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import Link from "next/link";

export default function BackupQRPage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code || "");

  const title = useMemo(() => `Backup QR: ${code}`, [code]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f6f6f6",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h1>
        <p style={{ marginTop: 8, opacity: 0.75, fontSize: 14 }}>
          Покажи этот QR на входе/выдаче, если браслет потерялся.
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div style={{ padding: 14, background: "white", borderRadius: 14, border: "1px solid #eee" }}>
            <QRCodeCanvas value={code} size={260} includeMargin />
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 16, fontWeight: 700 }}>
          Код: <span style={{ fontFamily: "monospace" }}>{code}</span>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ textDecoration: "none" }}>← Home</Link>
          <Link href="/checkin" style={{ textDecoration: "none" }}>Check In</Link>
          <Link href="/checkout" style={{ textDecoration: "none" }}>Check Out</Link>
        </div>

        <div style={{ marginTop: 16, fontSize: 12, opacity: 0.65 }}>
          Подсказка: на iPhone — Share → Add to Home Screen (как мини-приложение).
        </div>
      </div>
    </main>
  );
}
