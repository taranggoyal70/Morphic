import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
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

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${geistMono.variable} bg-ink text-paper antialiased`}
      >
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#024ad8",
              colorBackground: "#ffffff",
              colorForeground: "#1a1a1a",
              colorMutedForeground: "#636363",
              colorInput: "#ffffff",
              colorInputForeground: "#1a1a1a",
              borderRadius: "0.25rem",
            },
            elements: {
              cardBox: "shadow-sm shadow-black/10",
              card: "border border-black/10",
            },
          }}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
          <Toaster
            theme="light"
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
