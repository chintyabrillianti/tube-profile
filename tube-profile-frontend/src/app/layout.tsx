import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tube Profile | Tube & Pipe Cleaning Solutions",
  description:
    "Industrial tube and pipe cleaning solutions tailored to your equipment and application.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
