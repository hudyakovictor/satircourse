import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Header } from "@/components/Header";
import { Ticker } from "@/components/Ticker";

export const metadata: Metadata = {
  title: "Signal Arena — курс по анализу и торговле криптоактивами",
  description: "100 уровней, 500 карточек, 300+ иллюстраций. Курс по крипто-трейдингу в духе панк-таблоидной сатиры. Учебный материал, не инвестиционная рекомендация.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ProgressProvider>
          <Header />
          <Ticker />
          <main className="mx-auto max-w-7xl px-3 pb-24 pt-6 md:px-6">{children}</main>
          <footer className="mx-auto max-w-7xl px-3 pb-12 md:px-6">
            <div className="neo-in p-6 text-sm leading-relaxed text-[var(--mute)]">
              <strong className="text-[var(--ink)]">Учебный материал, не инвестиционная рекомендация.</strong> Стоп-заявка не гарантирует цену исполнения, плечо приводит к быстрой ликвидации,
              прошлые результаты не обещают будущих. До реальных сделок пройдите путь на учебном счёте. Регуляторы, как всегда, обеспокоены; мы — тоже, но с чек-листом.
              <div className="mt-2 text-xs">Signal Arena · курс по мотивам открытого репозитория hudyakovictor/cryptotradinglearn.</div>
            </div>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
