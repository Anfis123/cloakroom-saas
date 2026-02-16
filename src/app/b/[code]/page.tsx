"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useCloakroomStore } from "../../store/cloakroomStore";

export default function BackupWristbandPage() {
  const router = useRouter();

  const params = useParams<{ code: string }>();
  const code = useMemo(() => decodeURIComponent(params.code || ""), [params.code]);

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

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <button
              type="button"
              onClick={() => router.replace("/")}
              style={{
                border: "1px solid rgba(255,255,255,0.18)",
                background: "transparent",
                color: "white",
                borderRadius: 10,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 12,
                opacity: 0.95,
              }}
            >
              Home
            </button>

            <div
              style={{
                alignSelf: "flex-start",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                opacity: 0.9,
              }}
            >
              Status: {status}
            </div>
          </div>
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

        <div
          style={{
            marginTop: 14,
            fontSize: 13,
            opacity: 0.85,
            textAlign: "center",
          }}
        >
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
            Note: this code is not in the current device session. If staff uses another
            device, they must have the same event/session open.
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          Tip: Add to Home Screen to open it like an app.
        </div>
      </div>
    </main>
  );
}
