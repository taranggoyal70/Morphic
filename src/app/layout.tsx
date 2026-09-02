import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
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

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
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

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07111d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bricolage.variable} ${geistSans.variable} ${geistMono.variable} bg-ink text-white antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#78dce8",
              colorBackground: "#0b1826",
              colorForeground: "#f3f0e8",
              colorMutedForeground: "#9eb0bf",
              colorInput: "#102235",
              colorInputForeground: "#f3f0e8",
              borderRadius: "0.75rem",
            },
            elements: {
              cardBox: "shadow-2xl shadow-black/40",
              card: "border border-white/10",
            },
          }}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
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
