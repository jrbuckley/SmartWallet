import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "SmartWallet",
  description:
    "Track expenses, monitor investments, and discover savings opportunities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <SiteNav />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
