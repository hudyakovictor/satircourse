import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Trading Learn — панк-таблоидный курс по криптотрейдингу",
  description:
    "Визуальный интерактивный курс по анализу и торговле криптовалютой: структура рынка, риск-менеджмент, психология, on-chain и торговый плейбук.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
