"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

type Props = {
  onResult: (text: string) => void;
  onClose: () => void;
};

export default function QRScanner({ onResult, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    let active = true;

    (async () => {
      try {
        const video = videoRef.current;
        if (!video) return;

        await reader.decodeFromVideoDevice(
          undefined,
          video,
          (result, err) => {
            if (!active) return;

            if (result) {
              const text = result.getText();
              onResult(text);
              onClose();
              return;
            }

            const name = (err as any)?.name;
            if (err && name !== "NotFoundException") {
              setError("Camera error. Try again.");
            }
          }
        );
      } catch (e: any) {
        setError(
          e?.message ||
            "Camera permission denied or not available. Use HTTPS or localhost."
        );
      }
    })();

    return () => {
      active = false;

      // ✅ ВАЖНО:
      // В новой версии @zxing/browser НЕ вызываем reset() или stopContinuousDecode()
      // Просто останавливаем MediaStream — это корректный способ.

      try {
        const v = videoRef.current;
        const stream = v?.srcObject as MediaStream | null;
        stream?.getTracks().forEach((t) => t.stop());
        if (v) v.srcObject = null;
      } catch {}
    };
  }, [onResult, onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "white",
          borderRadius: 12,
          overflow: "hidden",
        }}
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
          <strong>Scan QR Code</strong>
          <button
            onClick={onClose}
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
          <video
            ref={videoRef}
            style={{ width: "100%", borderRadius: 10, background: "#000" }}
            muted
            playsInline
          />

          {error && (
            <div style={{ marginTop: 10, color: "crimson", fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
            Tip: Use QR (not barcode) for best camera scanning.
          </div>
        </div>
      </div>
    </div>
  );
}
