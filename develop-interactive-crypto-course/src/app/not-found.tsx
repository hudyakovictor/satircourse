import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <div className="stamp text-blood">Ошибка 404</div>
      <h1 className="mt-4 font-display text-6xl uppercase text-paper">Страница пересмотрела реальность</h1>
      <p className="mt-3 text-lg text-zinc-300">Она не исчезла. Она просто перераспределена в пользу более уверенных участников.</p>
      <Link href="/course" className="mt-6 inline-block border-2 border-black bg-toxic px-6 py-3 font-display uppercase text-black shadow-[5px_5px_0_#000]">
        Вернуться на карту
      </Link>
    </div>
  );
}
