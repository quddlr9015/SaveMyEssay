import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { LanguageSelector } from '@/components/LanguageSelector';
import { NavigationBar } from '@/components/NavigationBar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "에세이 채점 시스템",
  description: "AI 기반 에세이 채점 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <NavigationBar />
          <main className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
          <LanguageSelector />
        </Providers>
      </body>
    </html>
  );
}
