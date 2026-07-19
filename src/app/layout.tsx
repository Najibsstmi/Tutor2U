import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/site";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: siteConfig.brand.favicon16, sizes: "16x16", type: "image/png" },
      { url: siteConfig.brand.favicon32, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: siteConfig.brand.appleTouchIcon, sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: siteConfig.name,
    description:
      "Tutor yang disahkan, jadual masa nyata, laporan pembelajaran dan jaminan pengurusan Tutor2U.",
    type: "website",
    images: [{ url: siteConfig.brand.logo512, width: 512, height: 512, alt: `${siteConfig.name} logo` }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ms"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full overflow-x-hidden bg-slate-50 text-slate-950 antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <SiteHeader />
            {children}
            <Toaster richColors closeButton />
            <PwaRegister />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
