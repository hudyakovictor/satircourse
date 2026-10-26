import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JetBrains_Mono, Oswald, PT_Serif } from "next/font/google";
import "./globals.css";
import { SiteFooter, SiteHeader, Ticker } from "@/components/Chrome";

const display = Oswald({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = PT_Serif({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Департамент управляемой паники — курс по анализу и торговле криптовалют",
  description:
    "Интерактивный обучающий курс по анализу и торговле криптовалютами в жанре панк-таблоидной криптосатиры. 7 глав, 28 уроков, тренажёр паники, словарь и личное дело участника.",
  keywords: [
    "криптовалюта",
    "обучение трейдингу",
    "технический анализ",
    "риск-менеджмент",
    "DeFi",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${bodyFont.variable} ${mono.variable}`}
    >
      <body>
        <Ticker />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
