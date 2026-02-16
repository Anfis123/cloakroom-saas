"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useCloakroomStore } from "../../store/cloakroomStore";

export default function BackupWristbandPage() {
  const router = useRouter();
  const params = useParams();

  const code = useMemo(() => {
    const raw = (params as any)?.code;
    return typeof raw === "string" ? decodeURIComponent(raw) : "";
  }, [params]);

  const items = useCloakroomStore((s) => s.items);
  const item = useMemo(() => items.find((it) => it.code === code), [items, code]);

  const status = item?.status ?? "NOT_FOUND";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "#0b0b0b",
        color: "white",
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Digital Wristband</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>#{code}</div>
          </div>

          <button
            type="button"
            onClick={() => router.replace("/")}
            style={{
              alignSelf: "flex-start",
              padding: "6px 10px",
              borderRadius: 10,
              fontSize: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              opacity: 0.95,
            }}
          >
            Home
          </button>
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            opacity: 0.85,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Status: {status}</span>
          <span style={{ opacity: 0.7 }}>Keep this open / Add to Home Screen</span>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 12,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <QRCodeCanvas value={code} size={260} includeMargin />
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, textAlign: "center" }}>
          Show this QR to staff. They can scan it like a wristband.
        </div>

        {status === "NOT_FOUND" && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: "#ffd37a",
              textAlign: "center",
            }}
          >
            Note: this code is not in the current device session.
          </div>
        )}
      </div>
    </main>
  );
}
