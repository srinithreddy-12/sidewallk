import type { Metadata } from "next";
import { TownProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sidewallk — Sample Street",
  description:
    "An explorable demo town for creative communities. Sample data only — nothing here is a real business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <TownProvider>{children}</TownProvider>
      </body>
    </html>
  );
}
