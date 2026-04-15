import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForTem Labs - AI Agent Team Platform",
  description: "게임처럼 재미있고, 업무에는 강력한 AI 에이전트 팀 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden bg-[#1a1a2e]">{children}</body>
    </html>
  );
}
