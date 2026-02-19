import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wristband Cloakroom",
  description: "QR wristband cloakroom SaaS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          color: "white",
          background:
            "radial-gradient(1200px 700px at 50% 40%, rgba(120,120,120,0.25), rgba(0,0,0,0.95))",
          backgroundSize: "140% 140%",
          animation: "bgMove 18s ease-in-out infinite",
        }}
      >
        {children}

        <style>
          {`
            @keyframes bgMove {
              0% { background-position: 50% 40%; }
              50% { background-position: 60% 60%; }
              100% { background-position: 50% 40%; }
            }
          `}
        </style>
      </body>
    </html>
  );
}
