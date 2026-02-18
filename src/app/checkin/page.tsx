"use client";

import { useState } from "react";
import { useCloakroomStore } from "../store/cloakroomStore";
import { useRequireStaff } from "../utils/requireStaff";
import PageLayout from "../components/PageLayout";
import WristbandInput from "../components/WristbandInput";
import ItemsList from "../components/ItemsList";
import NavigationLinks from "../components/NavigationLinks";
import BackupQRModal from "../components/BackupQRModal";

// Strict validation regex for wristband codes
// Allows: alphanumeric characters, dashes, underscores
// Minimum length: 3 characters
const WRISTBAND_CODE_REGEX = /^[A-Za-z0-9_-]{3,}$/;

export default function CheckInPage() {
  const ready = useRequireStaff();

  const [wristband, setWristband] = useState("");
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [showBackup, setShowBackup] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const items = useCloakroomStore((s) => s.items);
  const checkIn = useCloakroomStore((s) => s.checkIn);

  const doCheckIn = (raw: string) => {
    const code = raw.trim();
    
    // Clear previous validation error
    setValidationError(null);
    
    // Validate empty string
    if (!code) {
      setValidationError("Wristband code cannot be empty");
      return;
    }

    // Strict regex validation
    if (!WRISTBAND_CODE_REGEX.test(code)) {
      setValidationError(
        "Invalid wristband code format. Code must contain only letters, numbers, dashes, or underscores, and be at least 3 characters long."
      );
      return;
    }

    checkIn(code);

    setWristband("");
    setLastCode(code);
    setShowBackup(true);
  };

  if (!ready) return null;

  const navigationLinks = [
    { href: "/checkout", label: "Go to Check Out →" },
    { href: "/", label: "← Back to Home" },
  ];

  return (
    <PageLayout
      title="Check In Item"
      subtitle="Scan wristband QR, then confirm check-in."
    >
      <div style={{ marginTop: 14 }}>
        <WristbandInput
          value={wristband}
          onChange={(value) => {
            setWristband(value);
            // Clear validation error when user types
            if (validationError) {
              setValidationError(null);
            }
          }}
          onConfirm={doCheckIn}
          placeholder="Scan wristband..."
          confirmLabel="Confirm Check In"
        />

        {validationError && (
          <div
            style={{
              marginTop: 8,
              padding: "8px 12px",
              background: "rgba(255, 59, 48, 0.1)",
              border: "1px solid rgba(255, 59, 48, 0.3)",
              borderRadius: 8,
              color: "#ff3b30",
              fontSize: 13,
            }}
          >
            {validationError}
          </div>
        )}

        <NavigationLinks links={navigationLinks} />
      </div>

      <ItemsList items={items} />

      <BackupQRModal
        code={lastCode || ""}
        isOpen={showBackup}
        onClose={() => setShowBackup(false)}
      />
    </PageLayout>
  );
}
