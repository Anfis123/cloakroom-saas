import Link from "next/link";

export default function Home() {
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
        background:
          "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.35), rgba(0,0,0,0.95))",
      }}
    >
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
    </main>
  );
}
