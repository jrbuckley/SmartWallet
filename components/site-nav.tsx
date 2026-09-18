"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
  { href: "/investments", label: "Investments" },
  { href: "/insights", label: "Insights" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="site-nav">
      <Link href="/dashboard" className="brand">
        SmartWallet
      </Link>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link${pathname === link.href ? " active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
