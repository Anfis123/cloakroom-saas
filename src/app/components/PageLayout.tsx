"use client";

import { ReactNode } from "react";

type PageLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  maxWidth?: string;
};

export default function PageLayout({
  children,
  title,
  subtitle,
  maxWidth = "min(560px, 100%)",
}: PageLayoutProps) {
  return (
    <div className="container">
      <main className="card" style={{ width: maxWidth, color: "white" }}>
        <h1 className="h1">{title}</h1>
        {subtitle && <div className="sub">{subtitle}</div>}
        {children}
      </main>
    </div>
  );
}
