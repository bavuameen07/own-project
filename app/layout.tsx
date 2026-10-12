import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/env";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${SITE_NAME} — Find Your Next Opportunity`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "jobs",
    "careers",
    "recruitment",
    "vacancies",
    "apply for jobs",
    "hiring",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Find Your Next Opportunity`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/android-chrome-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8F8F6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
