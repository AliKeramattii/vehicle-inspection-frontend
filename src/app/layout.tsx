import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { QueryProvider } from "@/components/providers/query-provider";
import { ViewportResize } from "@/components/layout/viewport-resize";
import "./globals.css";
import "@/components/ui/type-roles.css";
import "@/components/layout/refinement.css";
import "@/components/layout/customer-polish.css";
import "@/components/layout/viewport.css";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: { default: "بازدید خودرو", template: "%s | بازدید خودرو" },
  description: "بازدید آنلاین و امن خودرو",
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover", interactiveWidget: "resizes-content", themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      suppressHydrationWarning
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} min-h-full antialiased`}
    >
      <body>
        <Script src="/admin-theme-init.js" strategy="beforeInteractive" />
        <ViewportResize />
        <a href="#main-content" className="skip-link">رفتن به محتوای اصلی</a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
