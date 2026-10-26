import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-[90px]">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="sticker sticker--magenta">ОШИБКА 404 · СТРАНИЦА НЕ НАЙДЕНА</div>
          <h1
            className="mt-7"
            style={{ fontSize: "clamp(46px, 9vw, 118px)", lineHeight: 0.88 }}
          >
            СТРАНИЦА
            <br />
            <span style={{ color: "var(--magenta)" }}>ПЕРЕСМОТРЕЛА</span>
            <br />
            РЕАЛЬНОСТЬ
          </h1>
          <p className="lead mt-8 max-w-[34ch]">
            ЗАПРОШЕННЫЙ МАТЕРИАЛ НЕ НАЙДЕН. ВОЗМОЖНО, ОН БЫЛ У НАС. ВОЗМОЖНО, ЕГО ЗАБРАЛ
            КИТ.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn">
              ВЕРНУТЬСЯ НА ГЛАВНУЮ →
            </Link>
            <Link href="/course" className="btn btn--ghost">
              К ПРОГРАММЕ КУРСА
            </Link>
          </div>
        </div>
        <div className="memo">
          <h4>ОФИЦИАЛЬНОЕ СООБЩЕНИЕ ОБ ОТСУТСТВИИ</h4>
          <p>
            Департамент управляемой паники не располагает сведениями о запрошенном разделе.
            Все имеющиеся данные о вашем визите сохранены. Ваши ожидания — нет.
          </p>
          <div className="stamp">ДЕЛО ЗАКРЫТО</div>
        </div>
      </div>
    </div>
  );
}
