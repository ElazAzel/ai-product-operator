import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { PwaRegister } from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Product Operator",
  description: "Персональная операционная система обучения AI",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "AI Operator",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=JSON.parse(localStorage.getItem('ai-product-operator')||'{}');if(t.user&&t.user.theme==='light'){document.documentElement.classList.remove('dark')}}catch(e){}})()`
        }} />
        <meta name="application-name" content="AI Operator" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-full bg-zinc-950 text-zinc-50 dark:bg-zinc-950 dark:text-zinc-50">
        <PwaRegister />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
