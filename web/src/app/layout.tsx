import type { Metadata } from "next";
import { Inter, EB_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import clsx from 'clsx';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Smart Maggot Box | System Monitoring",
  description: "Real-time monitoring system for BSF maggot cultivation based on IoT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          inter.variable,
          garamond.variable,
          jetbrainsMono.variable,
          "antialiased min-h-screen bg-[var(--canvas)] text-[var(--body)]"
        )}
      >
        {children}
      </body>
    </html>
  );
}
