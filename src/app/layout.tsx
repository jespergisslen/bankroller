import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/Topbar";
import { CurrencyProvider } from "@/lib/currencyContext";

export const metadata: Metadata = {
  title: "Bankroller",
  description: "The terminal for serious bettors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-grid" />
        <div className="bg-glowtop" />
        <style>{`
          @keyframes pulse {
            0%   { box-shadow: 0 0 0 0 color-mix(in oklch, var(--accent) 60%, transparent); }
            70%  { box-shadow: 0 0 0 6px transparent; }
            100% { box-shadow: 0 0 0 0 transparent; }
          }
          @media (max-width: 720px) {
            .nav-label { display: none; }
          }
        `}</style>
        <CurrencyProvider>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Topbar />
            <main style={{ maxWidth: 1320, margin: "0 auto", padding: "26px 22px 90px" }}>
              {children}
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  );
}
