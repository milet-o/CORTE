'use client';

import React from 'react';

export interface CreatureConfig {
  body: number;  // 0 to 4
  eyes: number;  // 0 to 4
  mouth: number; // 0 to 4
  hat?: number;  // 0 to 5 (0 = Nenhum, 1 = Cartola, 2 = Festa, 3 = Boné, 4 = Coroa, 5 = Gorro)
}

interface CreatureAvatarProps {
  config?: CreatureConfig | null;
  color?: string; // hex
  size?: number; // px width/height, default 40
  className?: string;
}

export const DEFAULT_CREATURE: CreatureConfig = {
  body: 0,
  eyes: 0,
  mouth: 0,
  hat: 0,
};

export const HAT_NAMES = [
  'Nenhum',
  'Cartola',
  'Festa',
  'Boné',
  'Coroa',
  'Gorro',
];

export function getRandomCreature(): CreatureConfig {
  return {
    body: Math.floor(Math.random() * 5),
    eyes: Math.floor(Math.random() * 5),
    mouth: Math.floor(Math.random() * 5),
    hat: Math.floor(Math.random() * 6),
  };
}

export default function CreatureAvatar({
  config = DEFAULT_CREATURE,
  color = '#e8673a',
  size = 40,
  className = '',
}: CreatureAvatarProps) {
  const safeConfig = config || DEFAULT_CREATURE;
  const bodyIdx = (safeConfig.body ?? 0) % 5;
  const eyesIdx = (safeConfig.eyes ?? 0) % 5;
  const mouthIdx = (safeConfig.mouth ?? 0) % 5;
  const hatIdx = (safeConfig.hat ?? 0) % 6;

  return (
    <svg
      viewBox="0 -14 100 114"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. CORPO DA CRIATURA (KENNEY TOOLS STYLE) */}
      <g>
        {bodyIdx === 0 && (
          /* Slime / Gota fofa com base gordinha */
          <path
            d="M 50 14 C 74 14 86 32 86 56 C 86 78 74 88 50 88 C 26 88 14 78 14 56 C 14 32 26 14 50 14 Z"
            fill={color}
            stroke="#1d1714"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        )}

        {bodyIdx === 1 && (
          /* Squircle / Bloco arredondado */
          <rect
            x="16"
            y="16"
            width="68"
            height="72"
            rx="24"
            fill={color}
            stroke="#1d1714"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        )}

        {bodyIdx === 2 && (
          /* Fantasminha com ondas embaixo */
          <path
            d="M 18 86 C 18 38 22 14 50 14 C 78 14 82 38 82 86 C 75 81 70 86 65 86 C 60 86 55 81 50 81 C 45 81 40 86 35 86 C 30 86 25 81 18 86 Z"
            fill={color}
            stroke="#1d1714"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        )}

        {bodyIdx === 3 && (
          /* Redondinho com orelhinhas fofas */
          <>
            <circle cx="28" cy="22" r="9" fill={color} stroke="#1d1714" strokeWidth="4.5" />
            <circle cx="72" cy="22" r="9" fill={color} stroke="#1d1714" strokeWidth="4.5" />
            <circle cx="50" cy="54" r="34" fill={color} stroke="#1d1714" strokeWidth="4.5" />
          </>
        )}

        {bodyIdx === 4 && (
          /* Feijãozinho / Ovo largo */
          <ellipse
            cx="50"
            cy="52"
            rx="35"
            ry="36"
            fill={color}
            stroke="#1d1714"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
        )}

        {/* Brilho suave na cabeça / highlight cartoon */}
        <ellipse cx="40" cy="26" rx="8" ry="4" fill="#ffffff" opacity="0.35" transform="rotate(-15 40 26)" />
      </g>

      {/* 2. OLHOS (5 VARIANTES EXPRESSIVAS) */}
      <g>
        {eyesIdx === 0 && (
          /* Olhos esbugalhados fofos com reflexo branco */
          <>
            <circle cx="36" cy="46" r="9.5" fill="#ffffff" stroke="#1d1714" strokeWidth="3.5" />
            <circle cx="38" cy="46" r="4.5" fill="#1d1714" />
            <circle cx="36" cy="43" r="2" fill="#ffffff" />

            <circle cx="64" cy="46" r="9.5" fill="#ffffff" stroke="#1d1714" strokeWidth="3.5" />
            <circle cx="66" cy="46" r="4.5" fill="#1d1714" />
            <circle cx="64" cy="43" r="2" fill="#ffffff" />
          </>
        )}

        {eyesIdx === 1 && (
          /* Olhos felizes ^_^ */
          <>
            <path
              d="M 28 47 Q 37 36 46 47"
              fill="none"
              stroke="#1d1714"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 54 47 Q 63 36 72 47"
              fill="none"
              stroke="#1d1714"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </>
        )}

        {eyesIdx === 2 && (
          /* Óculos escuros estilosos */
          <>
            <path d="M 24 43 L 76 43" stroke="#1d1714" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="25" y="39" width="22" height="15" rx="5" fill="#1d1714" stroke="#1d1714" strokeWidth="2" />
            <rect x="53" y="39" width="22" height="15" rx="5" fill="#1d1714" stroke="#1d1714" strokeWidth="2" />
            <line x1="29" y1="42" x2="35" y2="51" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="57" y1="42" x2="63" y2="51" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {eyesIdx === 3 && (
          /* Ciclope fofinho (Um olhão central) */
          <>
            <circle cx="50" cy="44" r="14" fill="#ffffff" stroke="#1d1714" strokeWidth="3.5" />
            <circle cx="51" cy="44" r="7" fill="#1d1714" />
            <circle cx="48" cy="40" r="3" fill="#ffffff" />
          </>
        )}

        {eyesIdx === 4 && (
          /* Olhinhos de botão com bochechas coradas */
          <>
            <circle cx="35" cy="46" r="4.5" fill="#1d1714" />
            <circle cx="65" cy="46" r="4.5" fill="#1d1714" />
            <ellipse cx="26" cy="53" rx="4.5" ry="3" fill="#ff70a6" opacity="0.8" />
            <ellipse cx="74" cy="53" rx="4.5" ry="3" fill="#ff70a6" opacity="0.8" />
          </>
        )}
      </g>

      {/* 3. BOCA (5 VARIANTES CARTOON) */}
      <g>
        {mouthIdx === 0 && (
          /* Sorrisão aberto com linguinha rosa */
          <>
            <path
              d="M 38 60 Q 50 75 62 60 Z"
              fill="#1d1714"
              stroke="#1d1714"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M 44 67 Q 50 71 56 67 Z" fill="#ff70a6" />
          </>
        )}

        {mouthIdx === 1 && (
          /* Sorriso com dentinho de vampiro */
          <>
            <path
              d="M 38 61 Q 50 70 62 61"
              fill="none"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polygon
              points="44,63 48,63 46,68"
              fill="#ffffff"
              stroke="#1d1714"
              strokeWidth="1.5"
            />
          </>
        )}

        {mouthIdx === 2 && (
          /* Boquinha de 'O' fofinha surpresa */
          <ellipse
            cx="50"
            cy="64"
            rx="5"
            ry="6.5"
            fill="#1d1714"
          />
        )}

        {mouthIdx === 3 && (
          /* Bigodinho retrô */
          <path
            d="M 37 63 Q 44 58 50 63 Q 56 58 63 63 Q 56 69 50 64 Q 44 69 37 63 Z"
            fill="#1d1714"
          />
        )}

        {mouthIdx === 4 && (
          /* Boquinha de gatinho :3 */
          <path
            d="M 41 61 Q 45 66 50 62 Q 55 66 59 61"
            fill="none"
            stroke="#1d1714"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>

      {/* 4. CHAPÉUS (5 VARIANTES + NENHUM) */}
      <g>
        {hatIdx === 1 && (
          /* 1. Cartola Mágica / Top Hat */
          <g>
            <path
              d="M 36 17 L 38 1 L 62 1 L 64 17 Z"
              fill="#2b2d42"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Faixa vermelha */}
            <path d="M 36.5 12 L 63.5 12 L 64 16 L 36 16 Z" fill="#e0463a" />
            {/* Aba da cartola */}
            <path
              d="M 28 17 Q 50 15 72 17"
              stroke="#1d1714"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {hatIdx === 2 && (
          /* 2. Chapéu de Festa / Aniversário com pompom */
          <g>
            <polygon
              points="50,-8 34,17 66,17"
              fill="#f2b84b"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Listras festivas */}
            <path d="M 39 10 L 61 10" stroke="#e0463a" strokeWidth="3" />
            <path d="M 44 1 L 56 1" stroke="#4f7fd0" strokeWidth="2.5" />
            {/* Pompom no topo */}
            <circle cx="50" cy="-8" r="4" fill="#ffffff" stroke="#1d1714" strokeWidth="2.5" />
          </g>
        )}

        {hatIdx === 3 && (
          /* 3. Boné Descolado (Baseball Cap com aba lateral) */
          <g>
            <path
              d="M 32 17 C 32 6 68 6 68 17 Z"
              fill="#4f7fd0"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Aba do boné */}
            <path
              d="M 58 17 Q 78 17 80 13 Q 70 11 58 15 Z"
              fill="#f2b84b"
              stroke="#1d1714"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Botão no topo */}
            <circle cx="50" cy="6" r="2.5" fill="#1d1714" />
          </g>
        )}

        {hatIdx === 4 && (
          /* 4. Coroa de Ouro com Joias */
          <g>
            <polygon
              points="30,17 28,5 39,11 50,2 61,11 72,5 70,17"
              fill="#ffd166"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Joia central vermelha */}
            <circle cx="50" cy="10" r="2.5" fill="#e0463a" stroke="#1d1714" strokeWidth="1" />
            <circle cx="38" cy="13" r="1.8" fill="#4f7fd0" />
            <circle cx="62" cy="13" r="1.8" fill="#4f7fd0" />
          </g>
        )}

        {hatIdx === 5 && (
          /* 5. Gorrinho de Lã / Beanie com Pompom */
          <g>
            <path
              d="M 33 16 C 33 4 67 4 67 16 Z"
              fill="#e8673a"
              stroke="#1d1714"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Pompom felpudo */}
            <circle cx="50" cy="4" r="5" fill="#ffffff" stroke="#1d1714" strokeWidth="2.5" />
            {/* Barra dobrada de lã */}
            <rect
              x="30"
              y="13"
              width="40"
              height="6.5"
              rx="3"
              fill="#ffffff"
              stroke="#1d1714"
              strokeWidth="3"
            />
          </g>
        )}
      </g>
    </svg>
  );
}
