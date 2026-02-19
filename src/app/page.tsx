"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { staffLogout, useIsAdmin, useRequireStaff } from "@/app/utils/requireStaff";

export default function Home() {
  const ready = useRequireStaff();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  if (!ready) return null;

  const bg =
    "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.18), rgba(0,0,0,0.95))";

  const btn: React.CSSProperties = {
    width: 300,
    padding: "14px 18px",
    fontSize: 16,
    borderRadius: 14,
    background: "rgba(0,0,0,0.75)",
    color: "white",
    textDecoration: "none",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
  };

  const logoutBtn: React.CSSProperties = {
    position: "absolute",
    top: 18,
    right: 18,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    backdropFilter: "blur(6px)",
  };

  const logout = () => {
    staffLogout();
    router.replace("/login?next=%2F");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 22,
        color: "white",
        background: bg,
        position: "relative",
      }}
    >
      <button onClick={logout} style={logoutBtn}>
        Logout
      </button>

      <h1
        style={{
          fontSize: 44,
          fontWeight: 900,
          marginBottom: 12,
          textAlign: "center",
          textShadow: "0 2px 18px rgba(0,0,0,0.7)",
        }}
      >
        Wristband Cloakroom
      </h1>

      <Link href="/checkin" style={btn}>
        Check In Item
      </Link>

      <Link href="/checkout" style={btn}>
        Check Out Item
      </Link>

      <Link href="/history" style={btn}>
        History
      </Link>

      {isAdmin ? (
        <Link href="/generate" style={btn}>
          Generate Codes (Admin)
        </Link>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.55 }}>
          Admin buttons are hidden for staff.
        </div>
      )}
    </main>
  );
}
