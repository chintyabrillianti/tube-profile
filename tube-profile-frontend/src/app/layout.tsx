import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BENE | Solusi Pembersihan Tube & Pipe",
  description:
    "Layanan pembersihan tube dan pipe untuk kebutuhan peralatan dan aplikasi industri.",
  referrer: "no-referrer",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
