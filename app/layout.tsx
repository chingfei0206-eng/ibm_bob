import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高雄旅遊 AI 行程規劃",
  description: "由 Agnes AI 驅動，為您打造專屬高雄旅遊行程",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-sand-white">{children}</body>
    </html>
  );
}
