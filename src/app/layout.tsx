import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Morphic",
    template: "%s · Morphic",
  },
  description:
    "Adaptive workspaces that turn software outcomes into governed GitHub and Codex execution.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-ink text-white antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#5278e9",
              colorBackground: "#0d1213",
              colorForeground: "#eef3f1",
              colorMutedForeground: "#82908d",
              colorInput: "#12191b",
              colorInputForeground: "#eef3f1",
              borderRadius: "0.625rem",
            },
            elements: {
              cardBox: "shadow-2xl shadow-black/40",
              card: "border border-white/10",
            },
          }}
        >
          {children}
          <Toaster
            theme="dark"
            richColors
            toastOptions={{ className: "font-sans" }}
          />
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
