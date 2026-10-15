import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Слава Ніконоров — творче портфоліо", template: "%s | Слава Ніконоров" },
  description: "Кіно, театр, режисура, малюнки, тексти й світлини Слави Ніконорова.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
