import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Wristband Cloakroom</h1>

       <Link href="/checkin" className={styles.btn}>
  Check In Item
</Link>

<Link href="/checkout" className={styles.btn}>
  Check Out Item
</Link>



      </main>
    </div>
  );
}
