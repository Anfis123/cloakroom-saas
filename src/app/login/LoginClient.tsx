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
        padding: 16,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "min(420px, 100%)",
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 16,
          background: "white",
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0, fontWeight: 800 }}>Staff Login</h1>

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
            borderRadius: 10,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 16,
          }}
        />

        {err && <div style={{ marginTop: 10, color: "crimson" }}>{err}</div>}

        <button
          type="submit"
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: "black",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Continue
        </button>
      </form>
    </main>
  );
}
