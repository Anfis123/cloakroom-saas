"use client";

import { useState } from "react";
import QRScanner from "./QRScanner";

type WristbandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onConfirm: (value: string) => void;
  placeholder?: string;
  confirmLabel?: string;
  showScannerButton?: boolean;
};

export default function WristbandInput({
  value,
  onChange,
  onConfirm,
  placeholder = "Scan wristband...",
  confirmLabel = "Confirm",
  showScannerButton = true,
}: WristbandInputProps) {
  const [showScanner, setShowScanner] = useState(false);

  const handleScannerResult = (text: string) => {
    onConfirm(text);
    setShowScanner(false);
  };

  return (
    <>
      <div style={{ display: "grid", gap: 10 }}>
        <input
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(value);
          }}
        />

        {showScannerButton && (
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="btnSecondary"
          >
            Open Camera Scanner
          </button>
        )}

        <button type="button" onClick={() => onConfirm(value)} className="btn">
          {confirmLabel}
        </button>
      </div>

      {showScanner && (
        <QRScanner
          onResult={handleScannerResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
