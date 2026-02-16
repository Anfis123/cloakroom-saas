"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRequireStaff() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok = localStorage.getItem("staff_ok") === "1";
    if (!ok) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}
