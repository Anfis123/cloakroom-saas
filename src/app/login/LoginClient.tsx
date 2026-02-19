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

  const STAFF_PIN = process.env.NEXT_PUBLIC_STAFF_PIN || "1234";
  const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const p = pin.trim();

    // admin imeet prioritet esli pin sovpal
    if (ADMIN_PIN && p === ADMIN_PIN) {
      setStaffSession("admin");
      router.replace(next);
      return;
    }

    if (p === STAFF_PIN) {
      setStaffSession("staff");
      router.replace(next);
      return;
    }

    setErr("Wrong PIN");
  };

  const bg =
    "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.18), rgba(0,0,0,0.95))";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 22,
        background: bg,
        color: "white",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(520px, 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 18,
          padding: 18,
          background: "rgba(0,0,0,0.55)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: 28, margin: 0, fontWeight: 900 }}>Staff Login</h1>
        <div style={{ marginTop: 6, fontSize: 13, opacity: 0.78 }}>
          Enter PIN to access staff pages
        </div>

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN..."
          inputMode="numeric"
          autoFocus
          style={{
            marginTop: 12,
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            outline: "none",
            fontSize: 16,
            background: "rgba(0,0,0,0.35)",
            color: "white",
          }}
        />

        {err && (
          <div style={{ marginTop: 10, color: "#ff5a5a", fontWeight: 700 }}>
            {err}
          </div>
        )}

        <button
          type="submit"
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: "white",
            color: "#111",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 900,
          }}
        >
          Continue
        </button>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
          Tip: session expires automatically (idle + hidden lock).
        </div>

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
          {ADMIN_PIN
            ? "Tip: admin mode enabled (NEXT_PUBLIC_ADMIN_PIN)."
            : "Tip: set NEXT_PUBLIC_ADMIN_PIN in .env.local to enable admin mode."}
        </div>
      </form>
    </main>
  );
}
