import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "네온 부스 방탈출 타이머",
  description: "방탈출 게임용 타이머 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}


