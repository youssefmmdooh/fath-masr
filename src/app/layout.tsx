import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { Suspense } from "react";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "رحلة الفاتحين: فتح مصر | تلعيب دراسات اجتماعية",
  description:
    "موقع تعليمي تفاعلي مبني على التلعيب لدرس فتح مصر للصف السادس الابتدائي - إعداد الطالب يوسف ممدوح علي علي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-amber-50/50 text-stone-900 antialiased selection:bg-amber-300 selection:text-amber-950">
        <AuthProvider>
          <Suspense fallback={<div className="h-18 bg-amber-500" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="w-full bg-stone-900 text-stone-300 border-t-4 border-amber-600 py-6 px-4 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right text-xs">
              <div>
                <p className="font-bold text-amber-400 text-sm">
                  مبادرة التعلم التفاعلي: درس «فتح مصر»
                </p>
                <p className="text-stone-400 mt-1">
                  إعداد الطالب: يوسف ممدوح علي علي | الفرقة الثالثة (مجموعة ج) - الصف السادس الابتدائي
                </p>
              </div>
              <div className="flex items-center gap-3 text-stone-400">
                <span className="bg-stone-800 px-3 py-1.5 rounded-full border border-stone-700">
                  🏰 تعلم بالمتعة والتلعيب
                </span>
                <span className="bg-stone-800 px-3 py-1.5 rounded-full border border-stone-700">
                  ✨ تقييم فوري
                </span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
