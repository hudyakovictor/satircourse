import Link from "next/link";
import { tickerLines } from "@/content/course";

export function Ticker() {
  const line = [...tickerLines, ...tickerLines];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {line.map((t, i) => (
          <span className="ticker__item" key={i}>
            <b>◆</b> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Знак Департамента">
      <rect x="1.5" y="1.5" width="45" height="45" fill="none" stroke="#FF2E7E" strokeWidth="3" />
      <path d="M12 36 L12 18 C12 12 20 12 20 18 L20 30" fill="none" stroke="#E9E1D1" strokeWidth="3.4" />
      <path d="M28 36 L28 12 L36 12 L36 22" fill="none" stroke="#C7F52B" strokeWidth="3.4" />
      <path d="M8 41 L40 41" stroke="#E9E1D1" strokeWidth="3" />
    </svg>
  );
}

const NAV = [
  { href: "/course", label: "ПРОГРАММА" },
  { href: "/simulator", label: "ТРЕНАЖЁР ПАНИКИ" },
  { href: "/glossary", label: "СЛОВАРЬ" },
  { href: "/dashboard", label: "ЛИЧНОЕ ДЕЛО" },
];

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="wrap topbar__inner">
        <Link href="/" className="brand">
          <BrandMark />
          <span>
            ДЕПАРТАМЕНТ
            <br />
            <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.22em" }}>
              УПРАВЛЯЕМОЙ ПАНИКИ
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="navlink">
              {n.label}
            </Link>
          ))}
          <Link href="/course" className="btn btn--sm">
            ВОЙТИ В КУРС
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <BrandMark size={42} />
              <h3 style={{ fontSize: 26 }}>ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ</h3>
            </div>
            <p className="mt-4 max-w-[52ch]" style={{ color: "var(--muted)" }}>
              Образовательная программа по анализу и торговле криптовалютами. Мы не обещаем
              прибыль. Мы обещаем, что ты будешь понимать, почему её нет.
            </p>
          </div>
          <div>
            <div className="kicker mb-3">РАЗДЕЛЫ</div>
            <ul className="space-y-2">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="navlink">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="kicker mb-3">ОФИЦИАЛЬНОЕ УВЕДОМЛЕНИЕ</div>
            <div className="panel panel--paper">
              <p style={{ margin: 0, fontSize: 15 }}>
                НЕ ФИНАНСОВЫЙ СОВЕТ. МАТЕРИАЛ НОСИТ ОБРАЗОВАТЕЛЬНЫЙ ХАРАКТЕР И НЕ ЯВЛЯЕТСЯ
                ПРИГЛАШЕНИЕМ К СДЕЛКЕ. РЫНОК УЖЕ ВСЁ РЕШИЛ.
              </p>
              <div className="stamp mt-4">ОТКЛОНЕНО</div>
            </div>
          </div>
        </div>
        <div className="marquee-note mt-10">
          © {new Date().getFullYear()} ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ · ОТДЕЛ ОБУЧЕНИЯ И
          ПЕРЕРАСПРЕДЕЛЕНИЯ ОШИБОК · ВСЕ ПРАВА ПЕРЕСМОТРЕНЫ
        </div>
      </div>
    </footer>
  );
}
