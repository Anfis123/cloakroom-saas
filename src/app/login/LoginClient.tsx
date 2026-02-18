"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setStaffSession } from "../utils/requireStaff";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => {
    const raw = sp.get("next");
    return raw && raw.startsWith("/") ? raw : "/";
  }, [sp]);

  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // PIN berem iz env (klientskij)
  const STAFF_PIN = process.env.NEXT_PUBLIC_STAFF_PIN || "1234";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (pin.trim() !== STAFF_PIN) {
      setErr("Wrong PIN");
      return;
    }

    setStaffSession();
    router.replace(next);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
        color: "white",
        background:
          "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.35), rgba(0,0,0,0.95))",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(420px, 100%)",
          borderRadius: 16,
          padding: 18,
          background: "rgba(0,0,0,0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 style={{ fontSize: 26, margin: 0, fontWeight: 900 }}>
            Staff Login
          </h1>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Enter PIN to access staff pages
          </div>
        </div>

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN..."
          inputMode="numeric"
          autoFocus
          style={{
            marginTop: 14,
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            outline: "none",
            fontSize: 16,
            background: "rgba(255,255,255,0.06)",
            color: "white",
          }}
        />

        {err && (
          <div
            style={{
              marginTop: 10,
              color: "#ff6b6b",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {err}
          </div>
        )}

        <button
          type="submit"
          style={{
            marginTop: 14,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.85)",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          Continue
        </button>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.65 }}>
          Tip: session expires automatically (idle + hidden lock).
        </div>
      </form>
    </main>
  );
}
