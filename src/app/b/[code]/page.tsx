"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useCloakroomStore } from "../../store/cloakroomStore";

export default function BackupWristbandPage() {
  const router = useRouter();

  // ✅ bez generics — eto pravil'no dlya Next App Router
  const params = useParams();

  const code = useMemo(() => {
    const raw = params?.code;
    return typeof raw === "string" ? decodeURIComponent(raw) : "";
  }, [params]);

  const items = useCloakroomStore((s) => s.items);

  const item = useMemo(
    () => items.find((it) => it.code === code),
    [items, code]
  );

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
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
              #{code}
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "white",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Home
          </button>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 12,
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
