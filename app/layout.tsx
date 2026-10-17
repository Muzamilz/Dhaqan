import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Dhaqan", template: "%s · Dhaqan" },
  description: "Track customer credit, payments, and balances.",
};

export const viewport: Viewport = {
  themeColor: "#f5f6f2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
