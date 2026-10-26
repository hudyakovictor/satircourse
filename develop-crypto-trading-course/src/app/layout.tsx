import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { TopBar } from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Signal Arena — интерактивный курс по анализу и торговле криптоактивами",
  description: "100 уровней, 500 карточек, 200+ иллюстраций: от чтения цены до 100 сделок paper trading. Учебный материал, не инвестиционная рекомендация.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ProgressProvider>
          <TopBar />
          <main>{children}</main>
          <footer className="mt-20 border-t border-white/10 py-10 text-center text-sm text-[#8f9ccb]">
            <div className="mx-auto max-w-3xl px-4">
              <p className="font-bold text-[#c6d0f5]">Signal Arena · интерактивный курс из 100 уровней</p>
              <p className="mt-2">
                Учебный материал, не инвестиционная рекомендация. Рынок криптоактивов рискован: стоп-заявка не гарантирует цену исполнения, плечо может привести к быстрой ликвидации, прошлые результаты не обещают будущих. До реальных сделок пройдите весь путь на учебном счёте.
              </p>
              <p className="mt-3">
                <Link href="/docs/guide" className="underline underline-offset-4">Методика</Link> · <Link href="/docs/glossary" className="underline underline-offset-4">Глоссарий</Link> · <Link href="/materials" className="underline underline-offset-4">Шаблоны</Link>
              </p>
            </div>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
