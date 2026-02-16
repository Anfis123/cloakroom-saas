import Link from "next/link";

export default function Home() {
  const btn: React.CSSProperties = {
    width: 260,
    padding: "14px 18px",
    fontSize: 16,
    borderRadius: 12,
    background: "black",
    color: "white",
    textDecoration: "none",
    display: "inline-flex",
    justifyContent: "center",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 8 }}>
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
