import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/oswald/500.css";
import "@fontsource/oswald/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/800.css";
import "./globals.css";
import { PlayerProvider } from "@/components/PlayerProvider";
import { Header } from "@/components/Header";
import { MascotWidget } from "@/components/MascotWidget";
import { LESSONS } from "@/lib/course";

export const metadata: Metadata = {
  title: "Signal Arena — курс по анализу и торговле криптоактивами",
  description: "100 уровней, 500 карточек, 200+ иллюстраций и одна ржавая скрепка. Учебный курс. Не инвестиционная рекомендация. Рынок уже всё решил.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const clips = Object.fromEntries(LESSONS.map((l) => [l.id, l.clip]));
  return (
    <html lang="ru">
      <body>
        <PlayerProvider>
          <Header />
          <main className="relative z-10 mx-auto max-w-6xl px-4 pb-32 pt-6 md:pb-16">{children}</main>
          <footer className="relative z-10 mx-auto max-w-6xl px-4 pb-28 md:pb-10 text-xs text-muted leading-relaxed">
            <div className="border-t border-line pt-5">
              <b className="text-white">Учебный материал, не инвестиционная рекомендация.</b> Рынок криптоактивов рискован: стоп-заявка не гарантирует цену исполнения, плечо может привести к быстрой ликвидации, прошлые результаты не обещают будущих. До реальных сделок пройдите путь на paper-счёте. Если текст можно напечатать на кружке — он недостаточно конкретный.
              <div className="mt-2 font-mono opacity-70">Основано на открытом курсе hudyakovictor/cryptotradinglearn · Скрепка работает без ИИ.</div>
            </div>
          </footer>
          <MascotWidget clips={clips} />
        </PlayerProvider>
      </body>
    </html>
  );
}
