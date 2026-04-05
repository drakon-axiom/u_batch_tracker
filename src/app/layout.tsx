import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batch Tracker",
  description: "Internal batch tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-900 font-sans">{children}</body>
    </html>
  );
}
