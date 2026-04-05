import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batch Tracker",
  description: "Internal batch tracking system",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
