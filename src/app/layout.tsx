import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

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
      </head>
      <body className="min-h-full bg-zinc-950 text-zinc-50 dark:bg-zinc-950 dark:text-zinc-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
