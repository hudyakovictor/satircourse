import Image from "next/image";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import {
  dashboardStats,
  manifesto,
  modules,
  playbook,
  tickerItems,
} from "./course-data";

export const dynamic = "force-dynamic";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/78 backdrop-blur-sm">
      {children}
    </span>
  );
}

export default async function HomePage() {
  await db.execute(sql`select 1`);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="hero-noise pointer-events-none absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_center,rgba(232,121,249,0.14),transparent_35%)]" />

        <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-8 xl:gap-10">
          <div className="relative rounded-[28px] border border-white/12 bg-white/6 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 xl:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge>interactive crypto course</Badge>
              <Badge>punk tabloid edition</Badge>
              <Badge>2026 visual system</Badge>
            </div>

            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              ДЕПАРТАМЕНТ УПРАВЛЯЕМОЙ ПАНИКИ РЕКОМЕНДУЕТ НАЧАТЬ С ОСНОВ
            </div>

            <h1 className="mt-6 max-w-5xl text-[clamp(3rem,7vw,7.6rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-balance">
              Crypto Trading Learn
              <span className="mt-2 block text-transparent bg-[linear-gradient(90deg,#f9a8d4_0%,#fde68a_35%,#67e8f9_70%,#c4b5fd_100%)] bg-clip-text">
                рынок уже всё решил
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Полноценный визуальный курс по анализу и торговле криптовалютой. Не инфо-шум. Не культ свечи.
              Пять глав, десять уроков, таблицы, сценарии, ритуалы и интерфейс, который выглядит так, будто
              финансовая система призналась во всём под неоном.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {manifesto.map((item) => (
                <article
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm font-semibold uppercase leading-6 tracking-[0.12em] text-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  {item}
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-4 rounded-[24px] border border-white/10 bg-black/30 p-4 sm:grid-cols-4 sm:p-5">
              {dashboardStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">{stat.label}</div>
                  <div className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#120d13] p-3 shadow-[0_35px_90px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.25))]" />
              <Image
                src="/images/hero-cover.png"
                alt="Обложка курса по криптотрейдингу"
                width={500}
                height={500}
                className="h-auto w-full rounded-[24px] border border-white/10 object-cover"
                priority
              />
              <div className="absolute inset-x-6 bottom-6 rounded-[24px] border border-white/10 bg-black/45 p-5 backdrop-blur-md">
                <div className="text-xs font-semibold uppercase tracking-[0.26em] text-fuchsia-200">курс-плакат</div>
                <div className="mt-2 text-2xl font-black uppercase leading-none tracking-[-0.04em] text-white">
                  ТЕБЯ НЕ СПАСУТ МОТИВАЦИОННЫЕ ЦИТАТЫ
                </div>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
                  Спасает структура, риск-контроль и способность не нажимать кнопку в приступе веры.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {modules.slice(0, 4).map((module) => (
                <div key={module.id} className="rounded-[26px] border border-white/10 bg-white/6 p-4 backdrop-blur-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src={module.icon}
                      alt={module.shortTitle}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                    />
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.26em] text-white/40">{module.level}</div>
                      <h2 className="text-lg font-black uppercase tracking-[-0.03em] text-white">{module.shortTitle}</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/70">{module.strapline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ticker-wrap border-b border-white/10 bg-black/60 py-3">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div key={`${item}-${index}`} className="ticker-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200">карта курса</div>
                <h2 className="mt-2 text-3xl font-black uppercase tracking-[-0.04em] text-white">пять модулей выживания</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/55">
                ничего лишнего. всё опасно.
              </div>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-2">
              {modules.map((module) => (
                <article
                  key={module.id}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-black/35 p-4 transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.accent} opacity-80`} />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,14,0.15),rgba(12,12,14,0.92))]" />
                  <div className="relative">
                    <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
                      <Image
                        src={module.image}
                        alt={module.title}
                        width={500}
                        height={500}
                        className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.28em] text-white/50">{module.level}</div>
                        <h3 className="mt-2 text-[1.7rem] font-black uppercase leading-none tracking-[-0.04em] text-white">
                          {module.title}
                        </h3>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                        {module.duration}
                      </div>
                    </div>
                    <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/85">{module.strapline}</p>
                    <p className="mt-3 text-sm leading-6 text-white/70">{module.description}</p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {module.stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{stat.label}</div>
                          <div className="mt-1 text-xl font-black text-white">{stat.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/78">
                      <span className="font-black uppercase tracking-[0.16em] text-amber-200">Итог:</span> {module.outcome}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="grid gap-5">
            <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur-lg sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200">боевой протокол</div>
              <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white">
                сначала план. потом драма.
              </h3>
              <div className="mt-5 space-y-3">
                {playbook.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sm font-black text-white">
                        0{index + 1}
                      </div>
                      <div className="text-sm font-black uppercase tracking-[0.12em] text-white">{item.title}</div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">панель фракций</div>
              <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white">
                персонажи рынка
              </h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Кит", image: "/images/icon-whale.png", text: "Двигает рынок случайно. Ты называешь это новостью." },
                  { title: "Бык", image: "/images/icon-bull.png", text: "Покупает уверенность. Продаёт позже. Иногда тебе." },
                  { title: "Медведь", image: "/images/icon-bear.png", text: "Уважает гравитацию. Особенно после эйфории." },
                  { title: "Монета", image: "/images/icon-btc.png", text: "Символ свободы, стресса и очень дорогих выводов." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[22px] border border-white/10 bg-black/30 p-3">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={500}
                      height={500}
                      className="h-auto w-full rounded-[18px] border border-white/10 object-cover"
                    />
                    <div className="mt-3 text-sm font-black uppercase tracking-[0.12em] text-white">{item.title}</div>
                    <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-4 shadow-[0_35px_100px_rgba(0,0,0,0.3)] sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">глубокая часть курса</div>
              <h2 className="mt-2 text-[clamp(2rem,4vw,4rem)] font-black uppercase tracking-[-0.05em] text-white">
                уроки, ритуалы и таблицы
              </h2>
            </div>
            <div className="max-w-lg text-sm leading-6 text-white/65">
              Каждая глава собрана как визуальное досье: обложка, тезисы, сигналы опасности и таблица,
              которая объясняет механику без лирики и без инфлюенсерской магии.
            </div>
          </div>

          <div className="mt-8 space-y-10">
            {modules.map((module) => (
              <section key={module.id} className="rounded-[30px] border border-white/10 bg-black/25 p-4 sm:p-5 lg:p-6">
                <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-[26px] border border-white/10">
                      <Image
                        src={module.image}
                        alt={module.title}
                        width={500}
                        height={500}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">{module.level}</div>
                      <h3 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.04em] text-white">
                        {module.shortTitle}
                      </h3>
                      <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/86">{module.strapline}</p>
                      <p className="mt-4 text-sm leading-6 text-white/70">{module.outcome}</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {module.lessons.map((lesson) => (
                      <article key={lesson.id} className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-200">урок {lesson.id}</div>
                          <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">
                            контекст + механика + урон по эго
                          </div>
                        </div>

                        <h4 className="mt-3 text-2xl font-black uppercase leading-tight tracking-[-0.04em] text-white">
                          {lesson.title}
                        </h4>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-100/95">
                          {lesson.kicker}
                        </p>
                        <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-50/88">
                          <span className="font-black uppercase tracking-[0.16em]">предупреждение:</span> {lesson.warning}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-white/70">{lesson.objective}</p>

                        <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                          <div className="rounded-[22px] border border-white/10 bg-black/22 p-4">
                            <div className="text-xs font-black uppercase tracking-[0.16em] text-white">ключевые тезисы</div>
                            <ul className="mt-3 space-y-3 text-sm leading-6 text-white/72">
                              {lesson.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-[22px] border border-white/10 bg-black/22 p-4">
                            <div className="text-xs font-black uppercase tracking-[0.16em] text-white">ритуал исполнения</div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                              {lesson.ritual.map((step, index) => (
                                <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">шаг 0{index + 1}</div>
                                  <div className="mt-2 text-sm leading-6 text-white/78">{step}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10">
                          <div className="grid grid-cols-3 border-b border-white/10 bg-white/[0.04] text-[11px] font-black uppercase tracking-[0.18em] text-white/72">
                            {lesson.table.headers.map((header) => (
                              <div key={header} className="px-4 py-3">
                                {header}
                              </div>
                            ))}
                          </div>
                          <div className="divide-y divide-white/10">
                            {lesson.table.rows.map((row) => (
                              <div key={row.join("-")} className="grid grid-cols-3 bg-black/20 text-sm text-white/74">
                                {row.map((cell) => (
                                  <div key={cell} className="px-4 py-4 leading-6">
                                    {cell}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
