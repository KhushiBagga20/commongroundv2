import { memo, useId, type ReactNode } from 'react'
import { C, SWATCHES } from '@/data/palette'
import type { SwatchId } from '@/data/types'
import { seeded } from '@/lib/random'
import { DotDefs, Face, INK, line, Spark, StripeDefs, thin, type Mood } from './primitives'

interface P {
  m: string
  a: string
  bg: string
  dots: string
  stripes: string
  mood: Mood
}

const P_ = C.paper

const PIXEL_HEART = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...']

/* Each drawing lives in a 200×200 box. Flat fills, 4px ink line, halftone
   shading via the `dots` pattern, and a face where the object deserves one. */
const ART: Record<string, (p: P) => ReactNode> = {
  photography: ({ m, a, dots }) => (
    <>
      <ellipse cx="104" cy="176" rx="74" ry="8" fill={dots} />
      <circle cx="148" cy="62" r="8" fill={a} {...line} />
      <path d="M64 70 l12 -22 h52 l12 22" fill={m} {...line} />
      <rect x="24" y="66" width="152" height="98" rx="18" fill={m} {...line} />
      <rect x="26" y="132" width="148" height="14" fill={dots} />
      <rect x="38" y="80" width="28" height="15" rx="4" fill={a} {...line} />
      <circle cx="106" cy="114" r="38" fill={P_} {...line} />
      <circle cx="106" cy="114" r="25" fill={INK} />
      <circle cx="106" cy="114" r="13" fill={C.inkSoft} />
      <ellipse cx="96" cy="104" rx="7" ry="5" fill={P_} />
      <Spark x={170} y={34} r={11} fill={P_} />
    </>
  ),
  filmmaking: ({ m, a, stripes }) => (
    <>
      <rect x="34" y="92" width="132" height="84" rx="8" fill={P_} {...line} />
      <rect x="36" y="94" width="128" height="20" fill={INK} />
      <rect x="36" y="94" width="128" height="20" fill={stripes} />
      <path d="M52 134 h64 M52 152 h40" {...line} strokeWidth={5} />
      <circle cx="140" cy="146" r="12" fill={a} {...line} />
      <g className="clap" style={{ transformOrigin: '36px 90px' }}>
        <g transform="rotate(-16 36 90)">
          <rect x="34" y="64" width="132" height="26" rx="4" fill={m} {...line} />
          <path d="M60 66 l-14 22 M90 66 l-14 22 M120 66 l-14 22 M150 66 l-14 22" {...line} strokeWidth={7} />
        </g>
      </g>
      <Spark x={168} y={40} r={12} fill={a} />
    </>
  ),
  drawing: ({ m, a, dots }) => (
    <>
      <path d="M22 158 q20 -46 42 -4 t42 -4 t42 -4 t30 -18" fill="none" stroke={a} strokeWidth={9} strokeLinecap="round" />
      <path d="M22 158 q20 -46 42 -4 t42 -4 t42 -4 t30 -18" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.25} />
      <g transform="rotate(-38 100 96)">
        <rect x="44" y="78" width="98" height="36" fill={m} {...line} />
        <rect x="44" y="96" width="98" height="18" fill={dots} />
        <path d="M142 78 l36 18 l-36 18 z" fill={C.paperShade} {...line} />
        <path d="M166 90 l12 6 l-12 6 z" fill={INK} />
        <rect x="20" y="78" width="26" height="36" rx="7" fill={C.bubblegum} {...line} />
        <path d="M44 78 v36" {...line} />
      </g>
    </>
  ),
  'graphic-design': ({ m, a }) => (
    <>
      <path d="M28 152 C 60 30, 140 30, 172 152" fill="none" stroke={P_} strokeWidth={6} strokeLinecap="round" />
      <path d="M28 152 L58 40 M172 152 L142 40" stroke={P_} strokeWidth={2.5} strokeDasharray="5 6" />
      <rect x="19" y="143" width="18" height="18" fill={P_} {...thin} />
      <rect x="163" y="143" width="18" height="18" fill={P_} {...thin} />
      <circle cx="58" cy="40" r="8" fill={a} {...thin} />
      <circle cx="142" cy="40" r="8" fill={a} {...thin} />
      <path d="M100 66 l30 44 l-30 50 l-30 -50 z" fill={m} {...line} />
      <path d="M100 110 v50" {...line} />
      <circle cx="100" cy="108" r="7" fill={INK} />
      <rect x="80" y="160" width="40" height="18" rx="4" fill={a} {...line} />
    </>
  ),
  calligraphy: ({ m, a }) => (
    <>
      <path d="M34 150 C 64 52, 108 176, 164 70" fill="none" stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d="M34 150 C 64 52, 108 176, 164 70" fill="none" stroke={m} strokeWidth={22} strokeLinecap="round" />
      <g transform="rotate(38 150 54)">
        <rect x="140" y="-6" width="20" height="58" rx="6" fill={a} {...line} />
        <path d="M140 52 h20 l-10 28 z" fill={P_} {...line} />
        <path d="M150 62 v14" {...line} strokeWidth={2.5} />
      </g>
      <path d="M58 172 q-8 -14 0 -22 q8 8 0 22 z" fill={INK} />
      <Spark x={36} y={44} r={10} fill={P_} />
    </>
  ),
  zines: ({ m, a, dots }) => (
    <>
      <ellipse cx="100" cy="176" rx="72" ry="7" fill={dots} />
      <path d="M28 58 L100 72 L100 168 L28 156 Z" fill={P_} {...line} />
      <path d="M172 58 L100 72 L100 168 L172 156 Z" fill={m} {...line} />
      <path d="M44 86 l42 8 M44 102 l42 8 M44 118 l30 6 M44 134 l42 8" {...line} strokeWidth={3.5} />
      <circle cx="136" cy="104" r="20" fill={a} {...line} />
      <path d="M118 140 l38 -7" {...line} strokeWidth={5} />
      <rect x="96" y="92" width="8" height="16" rx="2" fill={C.paperShade} {...thin} />
      <rect x="96" y="132" width="8" height="16" rx="2" fill={C.paperShade} {...thin} />
      <path d="M130 98 l12 12 M142 98 l-12 12" {...line} strokeWidth={3} />
    </>
  ),
  coding: ({ m, a, mood }) => (
    <>
      <path d="M84 158 h32 l8 20 h-48 z" fill={a} {...line} />
      <rect x="22" y="40" width="156" height="118" rx="14" fill={m} {...line} />
      <circle cx="40" cy="56" r="5" fill={a} {...thin} />
      <circle cx="56" cy="56" r="5" fill={P_} {...thin} />
      <circle cx="72" cy="56" r="5" fill={P_} {...thin} />
      <rect x="36" y="70" width="128" height="74" rx="8" fill={INK} {...line} />
      <path d="M56 88 q-10 0 -10 10 v4 q0 4 -4 5 q4 1 4 5 v4 q0 10 10 10" fill="none" stroke={m} strokeWidth={4} strokeLinecap="round" />
      <path d="M144 88 q10 0 10 10 v4 q0 4 4 5 q-4 1 -4 5 v4 q0 10 -10 10" fill="none" stroke={m} strokeWidth={4} strokeLinecap="round" />
      <Face x={100} y={102} s={1.25} mood={mood} color={m} cheeks={false} />
    </>
  ),
  robotics: ({ m, a, mood }) => (
    <>
      <path d="M100 56 V34" {...line} />
      <circle cx="100" cy="30" r="9" fill={a} {...line} />
      <rect x="40" y="76" width="14" height="26" rx="4" fill={a} {...line} />
      <rect x="146" y="76" width="14" height="26" rx="4" fill={a} {...line} />
      <rect x="52" y="54" width="96" height="70" rx="16" fill={m} {...line} />
      <rect x="66" y="68" width="68" height="42" rx="9" fill={INK} />
      <Face x={100} y={84} s={1.05} mood={mood} color={m} cheeks={false} />
      <path d="M64 142 L36 160 M136 142 L164 160" {...line} strokeWidth={9} />
      <path d="M64 142 L36 160 M136 142 L164 160" stroke={a} strokeWidth={4} strokeLinecap="round" />
      <rect x="62" y="128" width="76" height="50" rx="12" fill={a} {...line} />
      <circle cx="100" cy="153" r="12" fill={P_} {...line} />
      <path d="M100 153 l6 -7" {...line} strokeWidth={3} />
      <circle cx="32" cy="164" r="8" fill={P_} {...line} />
      <circle cx="168" cy="164" r="8" fill={P_} {...line} />
    </>
  ),
  'game-dev': ({ m, a }) => (
    <>
      <g fill={a} stroke={INK} strokeWidth={2}>
        {PIXEL_HEART.flatMap((row, r) =>
          [...row].map((c, col) => (c === 'x' ? <rect key={`${r}-${col}`} x={72 + col * 8} y={20 + r * 8} width="8" height="8" /> : null)),
        )}
      </g>
      <path
        d="M52 84 h96 a32 32 0 0 1 30 42 l-12 32 a15 15 0 0 1 -26 3 l-14 -21 h-52 l-14 21 a15 15 0 0 1 -26 -3 l-12 -32 a32 32 0 0 1 30 -42 z"
        fill={m}
        {...line}
      />
      <path d="M58 104 h12 v-12 h12 v12 h12 v12 h-12 v12 h-12 v-12 h-12 z" fill={INK} />
      <circle cx="132" cy="104" r="8" fill={a} {...thin} />
      <circle cx="150" cy="118" r="8" fill={P_} {...thin} />
      <circle cx="132" cy="132" r="8" fill={C.butter} {...thin} />
      <circle cx="114" cy="118" r="8" fill={C.acid} {...thin} />
    </>
  ),
  'generative-art': ({ m, a }) => (
    <>
      <g fill="none" stroke={INK} strokeWidth={2.5}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx="100" cy="100" rx="74" ry="24" transform={`rotate(${i * 15} 100 100)`} />
        ))}
      </g>
      <circle cx="100" cy="100" r="22" fill={m} {...line} />
      <circle cx="100" cy="100" r="9" fill={a} {...thin} />
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return <circle key={deg} cx={100 + Math.cos(rad) * 74} cy={100 + Math.sin(rad) * 74} r="6" fill={a} {...thin} />
      })}
    </>
  ),
  electronics: ({ m, a }) => (
    <>
      <path d="M128 98 C 160 98, 132 58, 150 58" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M128 98 C 160 98, 132 58, 150 58" fill="none" stroke={m} strokeWidth={5} strokeLinecap="round" />
      <path d="M144 70 v-6 M156 70 v-6" {...line} />
      <path d="M138 62 v-16 a12 12 0 0 1 24 0 v16 z" fill={a} {...line} />
      <path d="M170 30 l6 -6 M176 46 h8 M150 22 v-8" {...line} strokeWidth={3} />
      <g {...line}>
        {[60, 78, 96, 114].map((x) => (
          <path key={x} d={`M${x} 82 v-14 M${x} 146 v14`} strokeWidth={6} />
        ))}
      </g>
      <rect x="46" y="82" width="86" height="64" rx="8" fill={INK} {...line} />
      <circle cx="60" cy="96" r="5" fill={P_} />
      <path d="M68 124 h44" stroke={P_} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <path d="M46 170 h40 l10 -10" fill="none" stroke={m} strokeWidth={5} strokeLinecap="round" />
    </>
  ),
  'music-production': ({ m, a }) => (
    <>
      <path d="M24 56 q16 -22 32 0 t32 0 t32 0 t32 0 t24 -6" fill="none" stroke={a} strokeWidth={6} strokeLinecap="round" />
      <rect x="22" y="80" width="156" height="84" rx="14" fill={m} {...line} />
      {[44, 76, 108, 140].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="100" r="9" fill={P_} {...thin} />
          <path d={`M${x} 100 l${[5, -3, 6, 0][i]} ${[-7, -8, -4, -9][i]}`} {...thin} />
        </g>
      ))}
      <rect x="160" y="92" width="8" height="18" rx="3" fill={a} {...thin} />
      <rect x="34" y="120" width="132" height="34" rx="4" fill={P_} {...thin} />
      {Array.from({ length: 7 }, (_, i) => (
        <path key={i} d={`M${34 + (i + 1) * 16.5} 120 v34`} {...thin} />
      ))}
      {[0, 1, 3, 4, 5].map((i) => (
        <rect key={i} x={34 + (i + 1) * 16.5 - 5} y="120" width="10" height="20" rx="2" fill={INK} />
      ))}
    </>
  ),
  guitar: ({ m, a }) => (
    <g transform="rotate(-28 100 100)">
      <rect x="92" y="6" width="16" height="70" fill={C.paperShade} {...line} />
      <rect x="86" y="0" width="28" height="18" rx="4" fill={INK} />
      {[28, 40, 52, 64].map((y) => (
        <path key={y} d={`M92 ${y} h16`} {...thin} />
      ))}
      <g stroke={INK} strokeWidth={8}>
        <circle cx="100" cy="94" r="30" />
        <circle cx="100" cy="142" r="40" />
      </g>
      <g fill={m}>
        <circle cx="100" cy="94" r="30" />
        <circle cx="100" cy="142" r="40" />
      </g>
      <path d="M72 150 a34 34 0 0 0 56 0" fill="none" stroke={a} strokeWidth={6} opacity={0.9} />
      <circle cx="100" cy="116" r="13" fill={INK} />
      <rect x="84" y="152" width="32" height="8" rx="3" fill={INK} />
      <path d="M96 10 V156 M100 10 V156 M104 10 V156" stroke={P_} strokeWidth={1.3} opacity={0.9} />
    </g>
  ),
  djing: ({ m, a }) => (
    <>
      <rect x="18" y="40" width="164" height="128" rx="16" fill={m} {...line} />
      <g className="amb-spin" style={{ transformOrigin: '86px 104px', ['--dur' as string]: '6s' }}>
        <circle cx="86" cy="104" r="52" fill={INK} {...line} />
        <circle cx="86" cy="104" r="40" fill="none" stroke={C.inkSoft} strokeWidth={2} />
        <circle cx="86" cy="104" r="30" fill="none" stroke={C.inkSoft} strokeWidth={2} />
        <circle cx="86" cy="104" r="17" fill={a} />
        <path d="M78 98 l10 6" stroke={P_} strokeWidth={3} strokeLinecap="round" />
        <circle cx="86" cy="104" r="3" fill={P_} />
      </g>
      <circle cx="158" cy="58" r="10" fill={P_} {...line} />
      <path d="M158 58 L150 104 L132 120" fill="none" {...line} strokeWidth={6} />
      <rect x="124" y="114" width="16" height="12" rx="3" fill={P_} {...thin} transform="rotate(-30 132 120)" />
      <rect x="150" y="124" width="16" height="36" rx="5" fill={P_} {...thin} />
      <rect x="148" y="136" width="20" height="8" rx="2" fill={a} {...thin} />
    </>
  ),
  'field-recording': ({ m, a, dots }) => (
    <>
      <g fill="none" stroke={P_} strokeWidth={5} strokeLinecap="round">
        <path d="M44 56 a44 44 0 0 0 0 52" />
        <path d="M28 44 a62 62 0 0 0 0 76" opacity={0.6} />
        <path d="M156 56 a44 44 0 0 1 0 52" />
        <path d="M172 44 a62 62 0 0 1 0 76" opacity={0.6} />
      </g>
      <path d="M100 168 c0 14 -24 10 -30 22" fill="none" {...line} />
      <rect x="86" y="110" width="28" height="62" rx="9" fill={a} {...line} />
      <rect x="92" y="126" width="16" height="6" rx="2" fill={INK} />
      <circle cx="100" cy="82" r="38" fill={m} {...line} />
      <circle cx="100" cy="82" r="36" fill={dots} />
      <g {...thin}>
        <path d="M76 64 l-4 -4 M92 52 l-1 -6 M112 52 l2 -6 M126 64 l5 -4 M134 82 h6 M66 82 h-6" />
      </g>
    </>
  ),
  pottery: ({ m, a, mood, dots }) => (
    <>
      <ellipse cx="100" cy="178" rx="66" ry="10" fill={INK} />
      <path
        d="M72 40 h56 c0 18 -14 22 -14 34 c0 12 36 20 36 52 c0 28 -24 42 -50 42 s-50 -14 -50 -42 c0 -32 36 -40 36 -52 c0 -12 -14 -16 -14 -34 z"
        fill={m}
        {...line}
      />
      <path d="M58 150 c20 8 64 8 84 0 c-6 14 -22 22 -42 22 s-36 -8 -42 -22 z" fill={dots} />
      <path d="M56 116 q11 -9 22 0 t22 0 t22 0 t22 0" fill="none" stroke={a} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx="100" cy="40" rx="28" ry="6" fill={a} {...line} />
      <Face x={100} y={136} s={1.05} mood={mood} />
    </>
  ),
  knitting: ({ m, a, mood }) => (
    <>
      <path d="M38 36 L156 172 M164 36 L46 172" {...line} strokeWidth={8} />
      <path d="M38 36 L156 172 M164 36 L46 172" stroke={C.paperShade} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx="38" cy="36" r="8" fill={a} {...line} />
      <circle cx="164" cy="36" r="8" fill={a} {...line} />
      <path d="M140 150 c18 6 22 22 40 26" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M140 150 c18 6 22 22 40 26" fill="none" stroke={m} strokeWidth={4} strokeLinecap="round" />
      <circle cx="100" cy="110" r="52" fill={m} {...line} />
      <g fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.75}>
        <path d="M60 84 q40 -22 80 0" />
        <path d="M52 104 q48 -26 96 0" />
        <path d="M70 152 q36 -60 72 -76" />
        <path d="M56 136 q30 -50 66 -74" />
      </g>
      <Face x={100} y={118} s={1.1} mood={mood} />
    </>
  ),
  woodworking: ({ m, a, dots }) => (
    <>
      <rect x="18" y="128" width="164" height="38" rx="4" fill={C.paperShade} {...line} />
      <path d="M30 140 q30 -6 60 2 t60 -2 M30 154 q40 6 80 -2 t60 2" fill="none" stroke={INK} strokeWidth={2} opacity={0.45} />
      <rect x="18" y="150" width="164" height="16" fill={dots} />
      <path d="M100 128 v-6" {...line} />
      <g transform="rotate(-12 110 80)">
        <path d="M30 70 L136 58 L140 104 L34 112 Z" fill={P_} {...line} />
        <path d="M34 112 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6" fill="none" {...thin} />
        <path d="M130 50 h28 a14 14 0 0 1 14 14 v32 a14 14 0 0 1 -14 14 h-24 z" fill={m} {...line} />
        <rect x="140" y="68" width="18" height="26" rx="6" fill={a} {...line} />
      </g>
      <g fill={C.paperShade} {...thin}>
        <circle cx="64" cy="122" r="3" />
        <circle cx="80" cy="116" r="2.5" />
        <circle cx="52" cy="114" r="2" />
      </g>
    </>
  ),
  origami: ({ m, a, dots }) => (
    <>
      <ellipse cx="102" cy="172" rx="60" ry="8" fill={dots} />
      <path d="M100 80 L36 34 L78 112 Z" fill={a} {...line} />
      <path d="M100 80 L176 52 L124 110 Z" fill={P_} {...line} />
      <path d="M58 124 L100 80 L144 124 L100 146 Z" fill={m} {...line} />
      <path d="M58 124 L26 70 L50 124 Z" fill={m} {...line} />
      <path d="M26 70 L16 82 L32 80 Z" fill={INK} {...thin} />
      <path d="M144 124 L184 98 L142 134 Z" fill={m} {...line} />
      <path d="M100 80 L100 146" {...thin} />
    </>
  ),
  sewing: ({ m, a }) => (
    <>
      <circle cx="84" cy="112" r="50" fill={m} {...line} />
      <circle cx="84" cy="112" r="38" fill="none" {...thin} />
      <path d="M72 100 L96 124 M96 100 L72 124" stroke={a} strokeWidth={6} strokeLinecap="round" />
      {[
        [72, 100],
        [96, 100],
        [72, 124],
        [96, 124],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill={INK} />
      ))}
      <path d="M96 100 C 140 60, 120 30, 150 26" fill="none" stroke={a} strokeWidth={5} strokeLinecap="round" />
      <g transform="rotate(30 160 100)">
        <path d="M156 20 h8 l2 140 l-6 20 l-6 -20 z" fill={P_} {...line} />
        <ellipse cx="160" cy="34" rx="2.5" ry="7" fill={INK} />
      </g>
    </>
  ),
  bouldering: ({ m, a, dots }) => (
    <>
      <path d="M18 30 L182 16 L188 184 L12 178 Z" fill={m} {...line} />
      <path d="M18 30 L182 16 L188 184 L12 178 Z" fill={dots} />
      <path d="M48 52 q18 -16 34 2 q6 16 -14 22 q-24 4 -20 -24 z" fill={a} {...line} />
      <path d="M118 66 q24 -8 30 10 q2 16 -22 14 q-16 -2 -8 -24 z" fill={P_} {...line} />
      <path d="M62 108 q14 -12 30 0 q10 14 -8 22 q-26 6 -22 -22 z" fill={C.bubblegum} {...line} />
      <path d="M132 124 q18 -14 30 4 q4 18 -16 18 q-22 -2 -14 -22 z" fill={a} {...line} />
      <path d="M44 150 q12 -8 22 2 q4 12 -10 12 q-16 0 -12 -14 z" fill={INK} />
      <rect x="128" y="152" width="34" height="30" rx="8" fill={P_} {...line} />
      <path d="M128 160 h34" {...thin} />
    </>
  ),
  skateboarding: ({ m, a }) => (
    <>
      <path d="M12 74 h34 M6 92 h28 M18 110 h22" {...line} />
      <g transform="rotate(-16 104 100)">
        <rect x="24" y="84" width="164" height="30" rx="15" fill={m} {...line} />
        <path d="M92 90 l20 -2 l-12 10 l18 -1 l-30 16 l10 -12 l-16 2 z" fill={a} {...thin} />
        <rect x="52" y="114" width="26" height="8" fill={INK} />
        <rect x="134" y="114" width="26" height="8" fill={INK} />
        <circle cx="56" cy="132" r="12" fill={a} {...line} />
        <circle cx="76" cy="132" r="12" fill={a} {...line} />
        <circle cx="138" cy="132" r="12" fill={a} {...line} />
        <circle cx="158" cy="132" r="12" fill={a} {...line} />
      </g>
    </>
  ),
  running: ({ m, a }) => (
    <>
      <path d="M14 96 h22 M8 116 h26 M18 136 h16" {...line} />
      <path d="M40 132 c0 -24 12 -48 34 -58 l20 -10 c10 22 32 30 52 32 c26 2 40 16 40 36 v8 h-146 z" fill={m} {...line} />
      <path d="M72 124 q44 -12 98 4" fill="none" stroke={a} strokeWidth={8} strokeLinecap="round" />
      <path d="M86 78 l12 8 M78 88 l14 6 M70 100 l16 4" {...line} strokeWidth={3.5} />
      <rect x="36" y="140" width="154" height="20" rx="10" fill={P_} {...line} />
      <path d="M52 150 h10 M76 150 h10 M100 150 h10 M124 150 h10 M148 150 h10" {...line} strokeWidth={3} />
    </>
  ),
  dance: ({ m, a, dots }) => (
    <>
      <path d="M100 8 V40" {...line} />
      <circle cx="100" cy="98" r="58" fill={m} {...line} />
      <g fill="none" stroke={INK} strokeWidth={2}>
        <ellipse cx="100" cy="98" rx="58" ry="16" />
        <ellipse cx="100" cy="98" rx="58" ry="36" />
        <ellipse cx="100" cy="98" rx="16" ry="58" />
        <ellipse cx="100" cy="98" rx="38" ry="58" />
      </g>
      <path d="M100 40 a58 58 0 0 1 0 116 a40 58 0 0 0 0 -116 z" fill={dots} />
      <rect x="66" y="62" width="14" height="10" fill={P_} transform="rotate(-20 73 67)" />
      <Spark x={30} y={44} r={12} fill={a} />
      <Spark x={172} y={150} r={10} fill={P_} />
      <Spark x={168} y={40} r={7} fill={P_} />
    </>
  ),
  cycling: ({ m, a }) => (
    <>
      {[54, 146].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="128" r="36" fill="none" stroke={INK} strokeWidth={8} />
          <circle cx={cx} cy="128" r="36" fill="none" stroke={P_} strokeWidth={2} opacity={0.5} />
          <path d={`M${cx - 30} 128 h60 M${cx} 98 v60 M${cx - 21} 107 l42 42 M${cx + 21} 107 l-42 42`} stroke={P_} strokeWidth={1.5} opacity={0.7} />
          <circle cx={cx} cy="128" r="5" fill={a} {...thin} />
        </g>
      ))}
      <path
        d="M54 128 L86 82 L136 82 L146 128 M86 82 L104 128 L54 128 M104 128 L136 82"
        fill="none"
        stroke={INK}
        strokeWidth={11}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M54 128 L86 82 L136 82 L146 128 M86 82 L104 128 L54 128 M104 128 L136 82"
        fill="none"
        stroke={m}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M78 70 h20" {...line} strokeWidth={8} />
      <path d="M136 82 l-4 -18 h16" fill="none" {...line} strokeWidth={6} />
      <circle cx="104" cy="128" r="7" fill={a} {...thin} />
    </>
  ),
  juggling: ({ m, a, mood }) => (
    <>
      <path d="M40 160 Q100 -4 160 160" fill="none" stroke={P_} strokeWidth={3} strokeDasharray="4 9" strokeLinecap="round" opacity={0.9} />
      <path d="M40 160 Q100 -4 160 160" fill="none" stroke={INK} strokeWidth={3} strokeDasharray="4 9" strokeLinecap="round" opacity={0.35} />
      <circle cx="56" cy="102" r="21" fill={m} {...line} />
      <path d="M38 96 q18 10 36 0" fill="none" stroke={P_} strokeWidth={4} />
      <circle cx="144" cy="102" r="21" fill={P_} {...line} />
      <path d="M126 108 q18 -10 36 0" fill="none" stroke={a} strokeWidth={4} />
      <circle cx="100" cy="50" r="24" fill={a} {...line} />
      <Face x={100} y={48} s={0.9} mood={mood} />
      <path d="M26 176 q8 -22 30 -18 q10 2 10 14 z" fill={C.paperShade} {...line} />
      <path d="M174 176 q-8 -22 -30 -18 q-10 2 -10 14 z" fill={C.paperShade} {...line} />
    </>
  ),
  sourdough: ({ m, mood }) => (
    <>
      <g fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" opacity={0.7}>
        <path d="M76 40 q-8 -10 0 -20 q8 -10 0 -20" />
        <path d="M100 36 q-8 -10 0 -20 q8 -10 0 -20" />
        <path d="M124 40 q-8 -10 0 -20 q8 -10 0 -20" />
      </g>
      <path d="M24 146 c0 -54 32 -86 76 -86 s76 32 76 86 c0 16 -10 26 -26 26 h-100 c-16 0 -26 -10 -26 -26 z" fill={m} {...line} />
      <path d="M62 92 q38 -26 78 2 q-40 -8 -78 -2 z" fill={C.paperShade} {...line} strokeWidth={3} />
      <g fill={P_} opacity={0.85}>
        <circle cx="54" cy="104" r="2.5" />
        <circle cx="70" cy="80" r="2" />
        <circle cx="148" cy="104" r="2.5" />
        <circle cx="132" cy="78" r="2" />
        <circle cx="160" cy="124" r="2" />
        <circle cx="42" cy="128" r="2" />
      </g>
      <Face x={100} y={128} s={1.15} mood={mood} />
    </>
  ),
  coffee: ({ m, a, mood, dots }) => (
    <>
      <g fill="none" stroke={a} strokeWidth={5} strokeLinecap="round">
        <path d="M148 34 q-8 -8 0 -16 q8 -8 0 -16" />
        <path d="M164 42 q-8 -8 0 -16 q8 -8 0 -16" />
      </g>
      <path d="M58 58 c-28 0 -32 46 -6 48" fill="none" {...line} strokeWidth={9} />
      <path d="M134 58 l22 -8 l-16 24 z" fill={m} {...line} />
      <path d="M62 54 h76 l-10 50 h-56 z" fill={m} {...line} />
      <rect x="66" y="104" width="68" height="12" rx="3" fill={INK} />
      <path d="M60 116 h80 l10 58 h-100 z" fill={m} {...line} />
      <path d="M60 116 h20 l-6 58 h-24 z" fill={dots} />
      <path d="M86 40 h28 l4 14 h-36 z" fill={INK} {...thin} />
      <circle cx="100" cy="36" r="7" fill={INK} />
      <Face x={104} y={142} s={1.05} mood={mood} />
    </>
  ),
  fermentation: ({ m, a, mood }) => (
    <>
      <rect x="54" y="60" width="92" height="116" rx="18" fill={P_} {...line} />
      <path d="M58 104 q11 -8 21 0 t21 0 t21 0 t21 0 v52 q0 16 -16 16 h-52 q-16 0 -16 -16 z" fill={m} />
      <g fill={P_} {...thin}>
        <circle cx="76" cy="130" r="6" />
        <circle cx="122" cy="148" r="4" />
        <circle cx="128" cy="118" r="5" />
        <circle cx="84" cy="82" r="4" />
        <circle cx="114" cy="74" r="3" />
      </g>
      <rect x="54" y="60" width="92" height="116" rx="18" fill="none" {...line} />
      <rect x="60" y="36" width="80" height="26" rx="6" fill={a} {...line} />
      <path d="M68 46 h64" stroke={P_} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      <rect x="70" y="118" width="60" height="38" rx="5" fill={C.butter} {...line} />
      <Face x={100} y={132} s={0.9} mood={mood} />
    </>
  ),
  astronomy: ({ m, a, dots }) => (
    <>
      <g transform="rotate(-20 112 84)">
        <ellipse cx="112" cy="84" rx="74" ry="17" fill="none" stroke={INK} strokeWidth={14} />
        <ellipse cx="112" cy="84" rx="74" ry="17" fill="none" stroke={a} strokeWidth={7} />
      </g>
      <circle cx="112" cy="84" r="42" fill={m} {...line} />
      <path d="M112 42 a42 42 0 0 1 0 84 a30 42 0 0 0 0 -84 z" fill={dots} />
      <circle cx="98" cy="70" r="7" fill="none" {...thin} />
      <circle cx="120" cy="102" r="5" fill="none" {...thin} />
      <g transform="rotate(-20 112 84)">
        <path d="M38 84 A74 17 0 0 0 186 84" fill="none" stroke={INK} strokeWidth={14} />
        <path d="M38 84 A74 17 0 0 0 186 84" fill="none" stroke={a} strokeWidth={7} />
      </g>
      <g transform="rotate(-32 60 156)">
        <rect x="20" y="146" width="80" height="20" rx="4" fill={P_} {...line} />
        <rect x="92" y="142" width="16" height="28" rx="3" fill={a} {...line} />
      </g>
      <path d="M58 172 l-14 24 M62 172 l14 24" {...line} strokeWidth={5} />
      <Spark x={34} y={40} r={10} fill={P_} />
      <Spark x={176} y={150} r={8} fill={P_} />
      <Spark x={170} y={24} r={5} fill={P_} stroke={false} />
    </>
  ),
  birdwatching: ({ m, a }) => (
    <>
      <path d="M14 152 h172" {...line} strokeWidth={7} />
      <path d="M150 152 q14 -14 30 -8 q-10 14 -30 8 z" fill={P_} {...line} strokeWidth={3} />
      <path d="M96 140 v12 M116 140 v12" {...line} />
      <path d="M58 116 l-30 -14 l8 30 z" fill={a} {...line} />
      <ellipse cx="106" cy="110" rx="48" ry="36" fill={m} {...line} />
      <circle cx="140" cy="76" r="24" fill={m} {...line} />
      <path d="M162 72 l20 6 l-20 8 z" fill={a} {...line} />
      <path d="M78 104 q28 -12 50 10 q-26 18 -50 -10 z" fill={a} {...line} />
      <circle cx="146" cy="72" r="7" fill={P_} {...thin} />
      <circle cx="148" cy="73" r="3.5" fill={INK} />
    </>
  ),
  gardening: ({ m, mood }) => (
    <>
      <path d="M100 116 C 100 90, 104 70, 100 44" fill="none" {...line} strokeWidth={5} />
      <path d="M100 76 c-34 -2 -50 -26 -44 -46 c26 0 44 18 44 46 z" fill={C.teal} {...line} />
      <path d="M100 62 c30 -6 52 -30 44 -52 c-26 2 -46 24 -44 52 z" fill={C.teal} {...line} />
      <path d="M100 76 c-16 -6 -28 -18 -34 -34 M100 62 c14 -10 26 -24 32 -40" fill="none" stroke={C.acid} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M58 124 h84 l-12 52 h-60 z" fill={m} {...line} />
      <rect x="50" y="110" width="100" height="20" rx="5" fill={m} {...line} />
      <Face x={100} y={150} s={1} mood={mood} />
    </>
  ),
  foraging: ({ m, a, mood }) => (
    <>
      <path d="M20 176 q6 -16 10 0 q4 -18 10 0 M160 176 q6 -16 10 0 q4 -18 10 0" fill="none" stroke={C.teal} strokeWidth={4} strokeLinecap="round" />
      <path d="M150 176 c-2 -16 -2 -24 -4 -32 h16 c-2 8 -2 16 -4 32 z" fill={P_} {...thin} />
      <path d="M134 146 c0 -16 10 -26 22 -26 s22 10 22 26 z" fill={a} {...line} />
      <path d="M76 114 c-4 30 -6 46 -12 60 h72 c-6 -14 -8 -30 -12 -60 z" fill={P_} {...line} />
      <path d="M22 106 c0 -48 34 -76 78 -76 s78 28 78 76 c0 8 -6 12 -14 12 h-128 c-8 0 -14 -4 -14 -12 z" fill={m} {...line} />
      <g fill={P_} {...thin}>
        <circle cx="64" cy="70" r="10" />
        <circle cx="112" cy="54" r="8" />
        <circle cx="146" cy="84" r="9" />
        <circle cx="92" cy="96" r="5" />
      </g>
      <Face x={100} y={142} s={0.95} mood={mood} />
    </>
  ),
  travel: ({ m, a }) => (
    <>
      <path d="M78 64 v-16 a8 8 0 0 1 8 -8 h28 a8 8 0 0 1 8 8 v16" fill="none" {...line} strokeWidth={8} />
      <rect x="28" y="62" width="144" height="104" rx="16" fill={m} {...line} />
      <rect x="58" y="62" width="12" height="104" fill={a} {...thin} />
      <rect x="130" y="62" width="12" height="104" fill={a} {...thin} />
      <circle cx="100" cy="100" r="18" fill={P_} {...line} />
      <path d="M100 86 l4 9 h10 l-8 6 l3 10 l-9 -6 l-9 6 l3 -10 l-8 -6 h10 z" fill={C.bubblegum} {...thin} />
      <rect x="82" y="128" width="40" height="22" rx="3" fill={C.bubblegum} {...thin} transform="rotate(-8 102 139)" />
      <path d="M88 136 h26 M88 143 h18" {...thin} transform="rotate(-8 102 139)" />
      <circle cx="52" cy="174" r="7" fill={INK} />
      <circle cx="148" cy="174" r="7" fill={INK} />
    </>
  ),
  chess: ({ m, a }) => (
    <>
      <g>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={20 + i * 20} y={176} width="20" height="12" fill={i % 2 ? P_ : INK} stroke={INK} strokeWidth={2} />
        ))}
      </g>
      <path
        d="M64 168 h80 l-8 -26 c-4 -16 -2 -26 6 -40 c10 -18 8 -40 -6 -56 c-12 -14 -30 -20 -46 -20 l-8 -12 l-8 16 c-14 8 -24 20 -32 36 l-12 20 c-4 8 2 16 10 14 l16 -4 c8 -2 14 -2 20 4 c-10 16 -20 32 -14 54 z"
        fill={m}
        {...line}
      />
      <path d="M114 36 c14 6 22 18 26 36" fill="none" stroke={a} strokeWidth={6} strokeLinecap="round" />
      <circle cx="96" cy="66" r="5" fill={INK} />
      <rect x="54" y="160" width="100" height="16" rx="5" fill={INK} />
    </>
  ),
  'tabletop-rpg': ({ m, a, mood }) => (
    <>
      <path d="M100 18 L172 60 L172 140 L100 182 L28 140 L28 60 Z" fill={m} {...line} />
      <path
        d="M100 18 L100 56 M172 60 L140 126 M28 60 L60 126 M100 182 L100 126 M172 140 L140 126 M28 140 L60 126 M100 56 L172 60 M100 56 L28 60"
        {...line}
        strokeWidth={3}
      />
      <path d="M100 56 L140 126 L60 126 Z" fill={a} {...line} />
      <Face x={100} y={100} s={1} mood={mood} />
    </>
  ),
  writing: ({ m, a }) => (
    <>
      <rect x="62" y="22" width="76" height="70" fill={P_} {...line} />
      <path d="M74 40 h52 M74 54 h40 M74 68 h48" {...line} strokeWidth={3} />
      <path d="M30 108 h140 l12 56 h-164 z" fill={m} {...line} />
      <rect x="38" y="84" width="124" height="22" rx="11" fill={INK} />
      <circle cx="34" cy="95" r="9" fill={a} {...line} />
      <circle cx="166" cy="95" r="9" fill={a} {...line} />
      {[0, 1, 2].map((row) =>
        Array.from({ length: 7 - row }, (_, i) => <circle key={`${row}-${i}`} cx={52 + row * 8 + i * 16} cy={124 + row * 14} r="5" fill={P_} {...thin} />),
      )}
    </>
  ),
  'language-learning': ({ m }) => (
    <>
      <path d="M44 106 l-10 22 l28 -14 z" fill={m} {...line} />
      <rect x="22" y="36" width="110" height="74" rx="22" fill={m} {...line} />
      <text x="77" y="88" textAnchor="middle" fontFamily="Archivo, sans-serif" fontWeight={900} fontSize="40" fill={INK}>
        Aa
      </text>
      <path d="M158 160 l10 22 l-28 -14 z" fill={P_} {...line} />
      <rect x="70" y="96" width="110" height="70" rx="22" fill={P_} {...line} />
      <circle cx="104" cy="131" r="7" fill={INK} />
      <circle cx="126" cy="131" r="7" fill={INK} />
      <circle cx="148" cy="131" r="7" fill={INK} />
    </>
  ),
  speedcubing: ({ m, a }) => <Cube top={m} left={a} />,
}

function Cube({ top, left }: { top: string; left: string }) {
  const rand = seeded('cube')
  const colors = [top, left, P_, C.bubblegum, C.acid, C.butter]
  const T = [100, 26]
  const R = [168, 64]
  const B = [100, 102]
  const L = [32, 64]
  const D = 76
  // a face is defined by origin o and two edge vectors u, v
  const faces = [
    { o: T, u: [L[0] - T[0], L[1] - T[1]], v: [R[0] - T[0], R[1] - T[1]], base: top },
    { o: L, u: [B[0] - L[0], B[1] - L[1]], v: [0, D], base: left },
    { o: B, u: [R[0] - B[0], R[1] - B[1]], v: [0, D], base: P_ },
  ]
  const cells: ReactNode[] = []
  faces.forEach((f, fi) => {
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const p = (a: number, b: number) => [f.o[0] + f.u[0] * a + f.v[0] * b, f.o[1] + f.u[1] * a + f.v[1] * b]
        const pts = [p(i / 3, j / 3), p((i + 1) / 3, j / 3), p((i + 1) / 3, (j + 1) / 3), p(i / 3, (j + 1) / 3)]
        const fill = rand() < 0.55 ? f.base : colors[Math.floor(rand() * colors.length)]
        cells.push(<polygon key={`${fi}-${i}-${j}`} points={pts.map((q) => q.join(',')).join(' ')} fill={fill} {...thin} />)
      }
  })
  return (
    <>
      {cells}
      <path
        d={`M${T} L${R} L${R[0]} ${R[1] + D} L${B[0]} ${B[1] + D} L${L[0]} ${L[1] + D} L${L} Z M${L} L${B} L${R} M${B} V${B[1] + D}`}
        fill="none"
        {...line}
      />
      <Spark x={170} y={30} r={10} fill={C.butter} />
    </>
  )
}

export interface HobbyArtProps {
  id: string
  swatch: SwatchId
  mood?: Mood
  className?: string
  title?: string
}

/** Original illustration for a hobby, coloured by its swatch. */
export const HobbyArt = memo(function HobbyArt({ id, swatch, mood = 'idle', className, title }: HobbyArtProps) {
  const uid = useId().replace(/:/g, '')
  const sw = SWATCHES[swatch]
  const draw = ART[id]
  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <DotDefs id={`d${uid}`} />
        <StripeDefs id={`s${uid}`} color={C.paper} gap={18} width={9} />
      </defs>
      {draw ? (
        draw({ m: sw.main, a: sw.alt, bg: sw.bg, dots: `url(#d${uid})`, stripes: `url(#s${uid})`, mood })
      ) : (
        <circle cx="100" cy="100" r="60" fill={sw.main} {...line} />
      )}
    </svg>
  )
})

export const hasArt = (id: string) => id in ART
