import Link from "next/link";
import { HeaderProgress } from "./Bits";

const NAV = [
  ["/course", "Карта курса"],
  ["/glossary", "Глоссарий"],
  ["/tools", "Калькуляторы"],
  ["/journal", "Журнал"],
  ["/factors", "777 факторов"],
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-[#0a0b11]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/mascot.png" alt="Скрепка" className="h-10 w-10 rounded-full border-2 border-black bg-[#15161d] object-cover object-top" />
          <span className="font-display text-xl uppercase leading-none tracking-wide text-paper">
            Signal <span className="text-toxic">Arena</span>
            <span className="block font-mono text-[10px] normal-case tracking-normal text-zinc-400">курс · 100 уровней · 0 гарантий</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map(([h, t]) => (
            <Link key={h} href={h} className="rounded px-3 py-1.5 font-display text-sm uppercase tracking-wide text-zinc-300 hover:bg-white/10 hover:text-toxic">
              {t}
            </Link>
          ))}
        </nav>
        <HeaderProgress />
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-1 md:hidden">
        {NAV.map(([h, t]) => (
          <Link key={h} href={h} className="whitespace-nowrap rounded px-2 py-1 font-display text-xs uppercase text-zinc-300">
            {t}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-black bg-[#05060a] px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl uppercase text-paper">
            Signal <span className="text-toxic">Arena</span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">Публичный комитет по спасению ликвидности благодарит вас за сотрудничество. Мы печатаем панику. Вы — читаете.</p>
        </div>
        <div className="text-sm text-zinc-400">
          <div className="font-display uppercase text-zinc-200">Официальное заявление</div>
          <p className="mt-2">
            Учебный материал, не инвестиционная рекомендация. Стоп-заявка не гарантирует цену исполнения, плечо может привести к быстрой ликвидации, прошлые результаты не обещают будущих. До реальных сделок пройдите весь путь на paper-счёте.
          </p>
        </div>
        <div className="text-sm text-zinc-400">
          <div className="font-display uppercase text-zinc-200">Служба навигации</div>
          <ul className="mt-2 space-y-1">
            {NAV.map(([h, t]) => (
              <li key={h}>
                <Link href={h} className="hover:text-toxic">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-xs text-zinc-500">Регуляторы обеспокоены. Рынок делает вид, что удивлён.</p>
        </div>
      </div>
    </footer>
  );
}
