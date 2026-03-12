import fs from 'node:fs/promises';
import path from 'node:path';
import { speciesList } from '../src/data/species.js';

const OUTPUT_DIR = path.resolve('src/assets/species-icons');

const ICON_CONFIG = {
  'giant-panda': { kind: 'panda', colors: { primary: '#f4f7fb', secondary: '#111827', accent: '#94a3b8' } },
  'snow-leopard': { kind: 'cat', colors: { primary: '#dbe4ee', secondary: '#475569', accent: '#111827' } },
  'amur-tiger': { kind: 'cat', colors: { primary: '#f59e0b', secondary: '#111827', accent: '#fcd34d' } },
  'asian-elephant': { kind: 'elephant', colors: { primary: '#8b7b72', secondary: '#433833', accent: '#d6c6b5' } },
  'african-elephant': { kind: 'elephant', colors: { primary: '#7c6d65', secondary: '#352f2b', accent: '#cdbcae' } },
  'polar-bear': { kind: 'bear', colors: { primary: '#f8fafc', secondary: '#334155', accent: '#dbeafe' } },
  'blue-whale': { kind: 'whale', colors: { primary: '#2563eb', secondary: '#1e3a8a', accent: '#93c5fd' } },
  orca: { kind: 'orca', colors: { primary: '#0f172a', secondary: '#f8fafc', accent: '#38bdf8' } },
  'humpback-whale': { kind: 'whale', colors: { primary: '#475569', secondary: '#0f172a', accent: '#cbd5e1' } },
  'green-sea-turtle': { kind: 'turtle', colors: { primary: '#16a34a', secondary: '#166534', accent: '#86efac' } },
  'komodo-dragon': { kind: 'lizard', colors: { primary: '#78716c', secondary: '#292524', accent: '#ca8a04' } },
  'king-cobra': { kind: 'cobra', colors: { primary: '#22c55e', secondary: '#166534', accent: '#bbf7d0' } },
  'saltwater-crocodile': { kind: 'crocodile', colors: { primary: '#3f6212', secondary: '#1a2e05', accent: '#bef264' } },
  'emperor-penguin': { kind: 'penguin', colors: { primary: '#111827', secondary: '#f8fafc', accent: '#f59e0b' } },
  'bald-eagle': { kind: 'eagle', colors: { primary: '#7c4a24', secondary: '#f8fafc', accent: '#eab308' } },
  albatross: { kind: 'seabird', colors: { primary: '#e2e8f0', secondary: '#64748b', accent: '#0ea5e9' } },
  shoebill: { kind: 'shoebill', colors: { primary: '#64748b', secondary: '#334155', accent: '#cbd5e1' } },
  'golden-poison-frog': { kind: 'frog', colors: { primary: '#facc15', secondary: '#854d0e', accent: '#fde68a' } },
  axolotl: { kind: 'axolotl', colors: { primary: '#f9a8d4', secondary: '#be185d', accent: '#fecdd3' } },
  'red-eyed-tree-frog': { kind: 'frog', colors: { primary: '#22c55e', secondary: '#ef4444', accent: '#facc15' } },
  'monarch-butterfly': { kind: 'butterfly', colors: { primary: '#f97316', secondary: '#111827', accent: '#fde68a' } },
  'honey-bee': { kind: 'bee', colors: { primary: '#facc15', secondary: '#111827', accent: '#93c5fd' } },
  'atlas-moth': { kind: 'moth', colors: { primary: '#b45309', secondary: '#78350f', accent: '#fcd34d' } },
  'red-kangaroo': { kind: 'kangaroo', colors: { primary: '#b45309', secondary: '#7c2d12', accent: '#fdba74' } },
  koala: { kind: 'koala', colors: { primary: '#94a3b8', secondary: '#334155', accent: '#e2e8f0' } },
  jaguar: { kind: 'cat', colors: { primary: '#d97706', secondary: '#111827', accent: '#fde68a' } },
  capybara: { kind: 'capybara', colors: { primary: '#8b5e3c', secondary: '#422006', accent: '#d6b08b' } },
  'red-panda': { kind: 'red-panda', colors: { primary: '#ea580c', secondary: '#7c2d12', accent: '#fef3c7' } },
  orangutan: { kind: 'orangutan', colors: { primary: '#ea580c', secondary: '#7c2d12', accent: '#fdba74' } },
  vaquita: { kind: 'porpoise', colors: { primary: '#64748b', secondary: '#0f172a', accent: '#e2e8f0' } },
};

function svgWrap(title, body) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">',
    `<title>${title}</title>`,
    body,
    '</svg>',
  ].join('');
}

function eyes(fill = '#0f172a', y = 114, size = 8) {
  return `<circle cx="102" cy="${y}" r="${size}" fill="${fill}"/><circle cx="154" cy="${y}" r="${size}" fill="${fill}"/>`;
}

function bear({ primary, secondary, accent }) {
  return `
    <circle cx="84" cy="78" r="26" fill="${secondary}"/>
    <circle cx="172" cy="78" r="26" fill="${secondary}"/>
    <circle cx="128" cy="128" r="78" fill="${primary}"/>
    <ellipse cx="128" cy="150" rx="36" ry="28" fill="${accent}"/>
    ${eyes(secondary)}
    <circle cx="128" cy="142" r="10" fill="${secondary}"/>
  `;
}

function panda({ primary, secondary }) {
  return `
    <circle cx="82" cy="80" r="24" fill="${secondary}"/>
    <circle cx="174" cy="80" r="24" fill="${secondary}"/>
    <circle cx="128" cy="128" r="78" fill="${primary}"/>
    <ellipse cx="102" cy="116" rx="18" ry="22" fill="${secondary}"/>
    <ellipse cx="154" cy="116" rx="18" ry="22" fill="${secondary}"/>
    <ellipse cx="128" cy="154" rx="34" ry="26" fill="#f8fafc"/>
    <circle cx="128" cy="144" r="10" fill="${secondary}"/>
    ${eyes('#111827', 118)}
  `;
}

function cat({ primary, secondary, accent }) {
  return `
    <path d="M76 98 94 54l26 28 8 90H72c-6-34-4-55 4-74Z" fill="${primary}"/>
    <path d="m180 98-18-44-26 28-8 90h56c6-34 4-55-4-74Z" fill="${primary}"/>
    <circle cx="128" cy="130" r="72" fill="${primary}"/>
    ${eyes(secondary, 118)}
    <path d="M112 150c8 8 24 8 32 0" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M92 95c12-10 22-14 36-16M164 95c-12-10-22-14-36-16" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="128" cy="140" r="10" fill="${secondary}"/>
  `;
}

function elephant({ primary, secondary, accent }) {
  return `
    <ellipse cx="82" cy="130" rx="40" ry="54" fill="${accent}"/>
    <ellipse cx="174" cy="130" rx="40" ry="54" fill="${accent}"/>
    <circle cx="128" cy="124" r="62" fill="${primary}"/>
    ${eyes(secondary, 118, 7)}
    <path d="M116 136c0 42 0 54 12 54s12-12 12-54" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/>
    <path d="M108 150c10 12 30 12 40 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function whale({ primary, secondary, accent }) {
  return `
    <path d="M44 134c20-36 54-58 110-52 28 3 47 13 58 30-9 7-16 17-20 28 0 0-22 6-38 4-2 18-16 36-42 42-37 10-72-8-82-34-2-6 0-12 14-18Z" fill="${primary}"/>
    <path d="M154 92c12-18 34-28 56-30-8 12-12 26-10 42" fill="${primary}"/>
    <path d="M80 146c14 10 34 12 50 2" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="88" cy="118" r="6" fill="${secondary}"/>
  `;
}

function orca({ primary, secondary, accent }) {
  return `
    <path d="M44 136c20-36 58-58 112-48 32 6 48 24 54 38-8 6-14 16-18 28-14 4-28 6-40 4-6 18-20 30-42 36-38 10-72-8-82-34-2-6 2-12 16-24Z" fill="${primary}"/>
    <path d="M118 108c8-12 16-18 30-18 16 0 26 8 34 18-14 6-28 8-42 8-8 0-14-2-22-8Z" fill="${secondary}"/>
    <ellipse cx="120" cy="146" rx="26" ry="16" fill="${secondary}"/>
    <path d="M138 78c12-18 28-26 50-28-8 12-12 22-10 38" fill="${accent}"/>
    <circle cx="88" cy="120" r="6" fill="${secondary}"/>
  `;
}

function turtle({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="132" rx="60" ry="74" fill="${primary}"/>
    <ellipse cx="128" cy="132" rx="40" ry="54" fill="${accent}"/>
    <ellipse cx="128" cy="56" rx="18" ry="14" fill="${primary}"/>
    <ellipse cx="72" cy="102" rx="18" ry="12" transform="rotate(-30 72 102)" fill="${primary}"/>
    <ellipse cx="184" cy="102" rx="18" ry="12" transform="rotate(30 184 102)" fill="${primary}"/>
    <ellipse cx="84" cy="192" rx="18" ry="12" transform="rotate(24 84 192)" fill="${primary}"/>
    <ellipse cx="172" cy="192" rx="18" ry="12" transform="rotate(-24 172 192)" fill="${primary}"/>
    <circle cx="122" cy="54" r="4" fill="${secondary}"/>
    <circle cx="134" cy="54" r="4" fill="${secondary}"/>
  `;
}

function lizard({ primary, secondary, accent }) {
  return `
    <path d="M62 144c20-40 54-66 92-66 18 0 34 6 42 14-18 4-28 12-36 26 12 10 20 24 24 44-16 4-32 2-46-8-8 18-24 28-46 30-14 2-28-10-30-24Z" fill="${primary}"/>
    <path d="M164 118c22 4 34 16 38 32" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <path d="M98 160c-8 12-18 20-30 24" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="158" cy="98" r="6" fill="${secondary}"/>
  `;
}

function cobra({ primary, secondary, accent }) {
  return `
    <path d="M128 62c32 0 54 22 54 52 0 18-8 34-22 44v38c0 14-14 26-32 26s-32-12-32-26v-38c-14-10-22-26-22-44 0-30 22-52 54-52Z" fill="${primary}"/>
    <path d="M86 106c8-20 24-30 42-30s34 10 42 30" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    ${eyes(secondary, 114, 6)}
    <path d="M128 132v34" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
  `;
}

function crocodile({ primary, secondary, accent }) {
  return `
    <path d="M54 146c14-30 44-54 96-58 28-2 50 8 62 22-12 8-18 18-20 30-10 6-24 10-38 10-8 0-18-2-26-4-8 16-24 28-50 34-18 4-30-12-24-34Z" fill="${primary}"/>
    <path d="M140 112h42" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="92" cy="114" r="6" fill="${secondary}"/>
    <path d="M74 154c18 6 34 6 48 2" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function penguin({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="134" rx="54" ry="78" fill="${primary}"/>
    <ellipse cx="128" cy="146" rx="34" ry="56" fill="${secondary}"/>
    <ellipse cx="128" cy="86" rx="28" ry="24" fill="${secondary}"/>
    ${eyes(primary, 86, 5)}
    <path d="M128 104 114 122h28Z" fill="${accent}"/>
  `;
}

function eagle({ primary, secondary, accent }) {
  return `
    <path d="M84 92c12-26 34-40 60-40 28 0 50 14 64 38-8 12-20 20-34 26 0 32-18 58-46 72-36-8-62-36-62-72 0-8 2-16 18-24Z" fill="${primary}"/>
    <path d="M102 98c10-18 24-28 42-28 22 0 38 10 50 28-12 10-28 18-46 18-18 0-34-6-46-18Z" fill="${secondary}"/>
    <path d="M134 126h38l-20 16Z" fill="${accent}"/>
    <circle cx="120" cy="116" r="6" fill="${secondary}"/>
  `;
}

function seabird({ primary, secondary, accent }) {
  return `
    <path d="M40 144c28-40 70-66 120-62 22 2 40 10 56 24-20 6-36 16-48 30-22 0-40 10-54 28-26 0-48-8-64-20-14-10-16-18-10-30Z" fill="${primary}"/>
    <path d="M146 104c20-18 42-28 66-28-10 14-16 28-16 46" fill="${accent}"/>
    <circle cx="110" cy="114" r="6" fill="${secondary}"/>
  `;
}

function shoebill({ primary, secondary, accent }) {
  return `
    <path d="M84 90c12-24 32-38 58-38 26 0 46 12 58 36-6 14-20 26-38 34v44c0 22-16 38-34 38s-34-16-34-38v-44c-18-8-32-20-40-32Z" fill="${primary}"/>
    <path d="M108 122h58c-4 20-18 34-38 34-16 0-28-10-20-34Z" fill="${accent}"/>
    ${eyes(secondary, 104, 5)}
  `;
}

function frog({ primary, secondary, accent }) {
  return `
    <circle cx="96" cy="82" r="18" fill="${accent}"/>
    <circle cx="160" cy="82" r="18" fill="${accent}"/>
    <ellipse cx="128" cy="134" rx="64" ry="70" fill="${primary}"/>
    <circle cx="96" cy="82" r="8" fill="${secondary}"/>
    <circle cx="160" cy="82" r="8" fill="${secondary}"/>
    <path d="M102 154c10 10 42 10 52 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function axolotl({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="132" rx="58" ry="54" fill="${primary}"/>
    <path d="M72 100 46 78M80 110 44 108M72 122 46 138" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    <path d="M184 100 210 78M176 110 212 108M184 122 210 138" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    ${eyes(secondary, 126, 6)}
    <path d="M108 150c12 8 28 8 40 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function butterfly({ primary, secondary, accent }) {
  return `
    <path d="M124 128c-10-30-36-58-68-58-14 0-24 10-24 24 0 34 28 62 70 64l22-30Z" fill="${primary}"/>
    <path d="M132 128c10-30 36-58 68-58 14 0 24 10 24 24 0 34-28 62-70 64l-22-30Z" fill="${primary}"/>
    <path d="M124 130c-10 26-30 54-58 58-18 2-32-8-34-24-2-28 20-48 58-58l34 24Z" fill="${accent}"/>
    <path d="M132 130c10 26 30 54 58 58 18 2 32-8 34-24 2-28-20-48-58-58l-34 24Z" fill="${accent}"/>
    <path d="M128 86v96" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M126 84 112 62M130 84l14-22" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
  `;
}

function moth({ primary, secondary, accent }) {
  return `
    <path d="M126 124c-12-26-38-52-68-52-16 0-30 12-30 28 0 30 26 56 70 58l28-34Z" fill="${primary}"/>
    <path d="M130 124c12-26 38-52 68-52 16 0 30 12 30 28 0 30-26 56-70 58l-28-34Z" fill="${primary}"/>
    <path d="M126 130c-12 22-28 42-56 48-20 4-34-8-36-26-2-22 18-38 54-44l38 22Z" fill="${accent}"/>
    <path d="M130 130c12 22 28 42 56 48 20 4 34-8 36-26 2-22-18-38-54-44l-38 22Z" fill="${accent}"/>
    <path d="M128 90v96" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    ${eyes(secondary, 122, 4)}
  `;
}

function bee({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="138" rx="44" ry="56" fill="${primary}"/>
    <path d="M100 104c-20-20-40-24-54-18 0 24 14 40 38 46ZM156 104c20-20 40-24 54-18 0 24-14 40-38 46Z" fill="${accent}"/>
    <path d="M96 124h64M94 144h68M100 164h56" stroke="${secondary}" stroke-width="12" stroke-linecap="round"/>
    ${eyes(secondary, 118, 6)}
    <path d="M118 88 106 70M138 88l12-18" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
  `;
}

function kangaroo({ primary, secondary, accent }) {
  return `
    <path d="M74 174c0-54 30-96 70-108 14-4 28 2 38 12-18 4-30 16-32 36 18 8 28 26 28 46 0 22-16 40-40 46-10 2-22-2-34-12v18H76c-6-16-8-28-2-38Z" fill="${primary}"/>
    <path d="M104 206c18-2 30-12 40-28" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M122 86 144 50l14 30" fill="${primary}"/>
    <circle cx="138" cy="102" r="6" fill="${secondary}"/>
    <path d="M146 146c10 8 18 8 28 0" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function koala({ primary, secondary, accent }) {
  return `
    <ellipse cx="84" cy="118" rx="30" ry="34" fill="${accent}"/>
    <ellipse cx="172" cy="118" rx="30" ry="34" fill="${accent}"/>
    <circle cx="128" cy="128" r="72" fill="${primary}"/>
    ${eyes(secondary, 118, 6)}
    <ellipse cx="128" cy="140" rx="18" ry="24" fill="${secondary}"/>
    <path d="M108 164c10 8 30 8 40 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function capybara({ primary, secondary, accent }) {
  return `
    <path d="M64 158c0-46 26-82 66-92 24-6 52 8 62 30-18 0-30 8-34 24 14 10 20 24 20 42 0 26-20 46-50 50-40 4-64-18-64-54Z" fill="${primary}"/>
    <circle cx="136" cy="110" r="8" fill="${secondary}"/>
    <path d="M150 136c8 8 18 10 30 4" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="92" cy="92" rx="12" ry="16" fill="${accent}"/>
  `;
}

function redPanda({ primary, secondary, accent }) {
  return `
    <path d="M78 98 98 60l26 26 4 88H72c-4-28-2-50 6-76Z" fill="${primary}"/>
    <path d="m178 98-20-38-26 26-4 88h56c4-28 2-50-6-76Z" fill="${primary}"/>
    <circle cx="128" cy="130" r="72" fill="${primary}"/>
    <path d="M94 118c10-12 22-18 34-20M162 118c-10-12-22-18-34-20" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <ellipse cx="128" cy="152" rx="34" ry="24" fill="${secondary}"/>
    ${eyes('#111827', 120, 6)}
    <circle cx="128" cy="142" r="9" fill="#111827"/>
  `;
}

function orangutan({ primary, secondary, accent }) {
  return `
    <ellipse cx="78" cy="128" rx="34" ry="44" fill="${accent}"/>
    <ellipse cx="178" cy="128" rx="34" ry="44" fill="${accent}"/>
    <circle cx="128" cy="132" r="62" fill="${primary}"/>
    <ellipse cx="128" cy="138" rx="34" ry="38" fill="${secondary}"/>
    ${eyes('#f8fafc', 126, 5)}
    <path d="M114 154c8 8 20 8 28 0" stroke="#f8fafc" stroke-width="8" stroke-linecap="round"/>
  `;
}

function porpoise({ primary, secondary, accent }) {
  return `
    <path d="M46 140c20-34 52-54 100-50 28 2 48 14 62 34-12 6-20 14-26 24-12 4-24 6-36 6-4 18-16 30-40 38-38 12-72-2-84-26-4-8 0-16 24-26Z" fill="${primary}"/>
    <path d="M142 84c12-18 28-28 52-30-10 12-14 24-12 40" fill="${accent}"/>
    <path d="M82 146c14 8 30 10 44 2" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="88" cy="118" r="6" fill="${secondary}"/>
  `;
}

const DRAWERS = {
  bear,
  panda,
  cat,
  elephant,
  whale,
  orca,
  turtle,
  lizard,
  cobra,
  crocodile,
  penguin,
  eagle,
  seabird,
  shoebill,
  frog,
  axolotl,
  butterfly,
  moth,
  bee,
  kangaroo,
  koala,
  capybara,
  'red-panda': redPanda,
  orangutan,
  porpoise,
};

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const species of speciesList) {
    const config = ICON_CONFIG[species.id];
    if (!config) {
      throw new Error(`Missing icon config for ${species.id}`);
    }

    const draw = DRAWERS[config.kind];
    if (!draw) {
      throw new Error(`Missing drawer for ${config.kind}`);
    }

    const svg = svgWrap(species.nameEn, draw(config.colors));
    const outputPath = path.join(OUTPUT_DIR, `species-${species.id}.svg`);
    await fs.writeFile(outputPath, `${svg}\n`, 'utf8');
    console.log(`generated ${path.relative(process.cwd(), outputPath)}`);
  }
}

main();
