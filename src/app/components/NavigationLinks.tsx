"use client";

import Link from "next/link";

type NavigationLink = {
  href: string;
  label: string;
};

type NavigationLinksProps = {
  links: NavigationLink[];
  className?: string;
};

export default function NavigationLinks({
  links,
  className = "row",
}: NavigationLinksProps) {
  return (
    <div className={className} style={{ marginTop: 6 }}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="btnSecondary"
          style={{ textAlign: "center" }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
