"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const submit = async () => {
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!r.ok) {
        const data = await r.json().catch(() => null);
        setErr(data?.error || "Oshibka login");
        setLoading(false);
        return;
      }

      router.replace(next);
    } catch {
      setErr("Setevaya oshibka");
    } finally {
      setLoading(false);
    }
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
      <div
        style={{
          width: "min(420px, 100%)",
          border: "1px solid #eee",
          borderRadius: 14,
          padding: 16,
        }}
      >
        <h1 style={{ fontSize: 24, margin: 0 }}>Staff Login</h1>
        <div style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
          Vvedi PIN chtoby otkryt check-in / check-out.
        </div>

        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN..."
          inputMode="numeric"
          style={{
            marginTop: 14,
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 16,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />

        <button
          type="button"
          onClick={submit}
          disabled={loading || pin.trim().length === 0}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "none",
            background: "black",
            color: "white",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
            fontSize: 16,
          }}
        >
          {loading ? "Checking..." : "Login"}
        </button>

        {err && (
          <div style={{ marginTop: 10, color: "#b00020", fontSize: 13 }}>
            {err}
          </div>
        )}
      </div>
    </main>
  );
}
