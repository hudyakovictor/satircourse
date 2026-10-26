import { ProgressBoard } from "@/components/ProgressBoard";
import { MODULE_COLORS } from "@/lib/art/primitives";
import { modules } from "@/lib/course";

export const metadata = { title: "Прогресс — Signal Arena" };

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <header className="neo p-6 md:p-10">
        <div className="kicker">Служба внутреннего учёта</div>
        <h1 className="headline mt-2 text-4xl md:text-6xl">Прогресс. <span className="marker">Рынок ведёт свой счёт</span></h1>
        <p className="mt-4 max-w-2xl text-base font-semibold">Уровень закрывается решением, стопом и записью. Прибыльная случайность не засчитывается. Прогресс хранится в базе данных по анонимному ключу этого браузера.</p>
      </header>
      <ProgressBoard modules={modules.map((m) => ({ id: m.id, title: m.title, color: MODULE_COLORS[m.id], lessons: m.lessons.map((l) => ({ id: l.id, title: l.title })) }))} />
    </div>
  );
}
