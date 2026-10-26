import { C, Card, Icon, Mascot, Pill, T, type K } from "./primitives";

export function GlitchScene({ k, n }: { k: K; n: number }) {
  const props = (() => {
    switch (n) {
      case 1:
        return (
          <g>
            <path d="M128 98Q160 40 210 76T262 40" stroke={C.amber} strokeWidth="4" strokeDasharray="6 8" fill="none" strokeLinecap="round" />
            <rect x="282" y="116" width="150" height="190" rx="28" fill="#e6ebf6" filter={k.inset} />
            <line x1="357" y1="132" x2="357" y2="290" stroke={C.down} strokeWidth="4" strokeLinecap="round" />
            <rect x="328" y="170" width="58" height="92" rx="12" fill={k.down} />
            <Pill k={k} x={300} y={326} w={114} h={30} text="ВЧЕРАШНЯЯ СВЕЧА" size={10} color={C.down} />
            <Icon name="clock" x={392} y={90} s={0.8} c={C.violet} />
          </g>
        );
      case 2:
        return (
          <g>
            <path d="M286 110H440V290Q430 304 418 290Q408 318 396 290Q384 330 370 290Q356 312 344 290Q330 326 316 290Q302 306 286 290Z" fill={C.teal} opacity=".55" filter={k.raiseS} />
            <circle cx="330" cy="200" r="10" fill="#fff" opacity=".6" />
            <circle cx="390" cy="160" r="7" fill="#fff" opacity=".6" />
            <Pill k={k} x={296} y={326} w={130} h={30} text="СТЕНА ИЗ ЖЕЛЕ" size={11} color={C.teal} />
          </g>
        );
      case 3:
        return (
          <g>
            <Icon name="coin" x={246} y={60} s={1.3} />
            <rect x="270" y="150" width="170" height="150" rx="24" fill="#e6ebf6" filter={k.inset} />
            <polyline points="284,250 310,190 336,260 362,190 388,260 414,200 428,240" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {[310, 362, 414].map((x) => (
              <g key={x}>
                <circle cx={x} cy={170} r="13" fill={k.down} />
                <path d={`M${x - 5} 165L${x + 5} 175M${x + 5} 165L${x - 5} 175`} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </g>
            ))}
            <Pill k={k} x={290} y={326} w={130} h={30} text="6 ЛОЖНЫХ СИГНАЛОВ" size={10} color={C.down} />
          </g>
        );
      case 4:
        return (
          <g>
            <g transform="translate(330 150)">
              <path d="M16 0H48L64 16V48L48 64H16L0 48V16Z" fill={k.down} filter={k.raiseS} />
              <rect x="12" y="28" width="40" height="8" rx="4" fill="#fff" />
              <path d="M20 64L14 92M44 64L52 92" stroke="#7a4a36" strokeWidth="6" strokeLinecap="round" />
              <rect x="74" y="36" width="30" height="26" rx="6" fill="#fff" filter={k.raiseS} />
              <path d="M82 28Q86 18 82 10M92 28Q96 18 92 10" stroke={C.mute} strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
            <T x={370} y={300} size={30} fill={C.down} w={900}>−1.8R</T>
            <Pill k={k} x={290} y={326} w={130} h={30} text="СТОП УШЁЛ ЗА КОФЕ" size={10} color={C.down} />
          </g>
        );
      case 5:
        return (
          <g>
            <rect x="290" y="130" width="150" height="80" rx="20" fill="#fff" filter={k.raiseS} />
            <rect x="440" y="158" width="14" height="24" rx="5" fill={C.mute} />
            <rect x="300" y="140" width="32" height="60" rx="12" fill={C.down} />
            <Pill k={k} x={290} y={236} w={150} h={34} text="FUNDING −0.01%/8ч" size={11} color={C.down} />
            <polyline points="290,316 330,304 370,296 410,282 440,270" fill="none" stroke={C.down} strokeWidth="4" strokeLinecap="round" />
            <Pill k={k} x={296} y={336} w={130} h={28} text="АРЕНДА ПОЗИЦИИ" size={10} color={C.ink} />
          </g>
        );
      default:
        return (
          <g>
            <circle cx="360" cy="190" r="86" fill={k.card} filter={k.raise} />
            <circle cx="360" cy="190" r="64" fill={k.down} filter={k.raiseS} />
            <T x={360} y={198} size={17} fill="#fff" w={900}>ОТЫГРАТЬСЯ</T>
            <Icon name="clock" x={400} y={272} s={0.9} c={C.violet} />
            <Icon name="book" x={306} y={272} s={0.9} c={C.blue} />
            <Pill k={k} x={296} y={336} w={130} h={28} text="ПАУЗА + ЖУРНАЛ" size={10} color={C.up} />
          </g>
        );
    }
  })();
  return (
    <g>
      <Card k={k} x={28} y={28} w={444} h={444} r={44} />
      <Mascot k={k} x={26} y={92} s={0.98} mood={n % 2 ? "point" : "shrug"} />
      {props}
      <Pill k={k} x={180} y={412} w={140} h={30} text={`GLITCH 0${n}`} size={12} color={C.violet} />
    </g>
  );
}
