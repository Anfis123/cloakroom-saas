"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = () => {
    try {
      localStorage.removeItem("staff_ok");
      localStorage.removeItem("staff_until");
    } catch {}
    router.replace("/login");
  };

  return (
    <button
      onClick={logout}
      style={{
        position: "fixed",
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
        zIndex: 9999,
      }}
    >
      Logout
    </button>
  );
}
