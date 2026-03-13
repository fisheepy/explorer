import fs from 'node:fs/promises';
import path from 'node:path';
import { speciesList } from '../src/data/species.js';

const OUTPUT_DIR = path.resolve('src/assets/species-icons');

const ICON_CONFIG = {
  'giant-panda': { kind: 'bear-body', colors: { primary: '#f8fafc', secondary: '#111827', accent: '#dbeafe' } },
  'snow-leopard': { kind: 'cat-body', colors: { primary: '#d9e2ec', secondary: '#475569', accent: '#94a3b8' } },
  'amur-tiger': { kind: 'cat-body', colors: { primary: '#f59e0b', secondary: '#111827', accent: '#fcd34d' } },
  'asian-elephant': { kind: 'elephant-asian', colors: { primary: '#9a6b4a', secondary: '#4a2f20', accent: '#f7e7ce' } },
  'african-elephant': { kind: 'elephant-african', colors: { primary: '#73808c', secondary: '#253140', accent: '#f8fafc' } },
  'polar-bear': { kind: 'bear-body', colors: { primary: '#f8fafc', secondary: '#475569', accent: '#bfdbfe' } },
  'blue-whale': { kind: 'whale-profile', colors: { primary: '#2563eb', secondary: '#1e3a8a', accent: '#93c5fd' } },
  orca: { kind: 'orca-profile', colors: { primary: '#0f172a', secondary: '#f8fafc', accent: '#38bdf8' } },
  'humpback-whale': { kind: 'whale-profile', colors: { primary: '#475569', secondary: '#0f172a', accent: '#cbd5e1' } },
  'green-sea-turtle': { kind: 'turtle-top', colors: { primary: '#16a34a', secondary: '#166534', accent: '#86efac' } },
  'komodo-dragon': { kind: 'lizard-body', colors: { primary: '#78716c', secondary: '#292524', accent: '#ca8a04' } },
  'king-cobra': { kind: 'cobra-coil', colors: { primary: '#22c55e', secondary: '#166534', accent: '#dcfce7' } },
  'saltwater-crocodile': { kind: 'croc-profile', colors: { primary: '#3f6212', secondary: '#1a2e05', accent: '#bef264' } },
  'emperor-penguin': { kind: 'penguin-body', colors: { primary: '#111827', secondary: '#f8fafc', accent: '#f59e0b' } },
  'bald-eagle': { kind: 'eagle-body', colors: { primary: '#7c4a24', secondary: '#f8fafc', accent: '#f59e0b' } },
  albatross: { kind: 'albatross-flight', colors: { primary: '#e2e8f0', secondary: '#64748b', accent: '#38bdf8' } },
  shoebill: { kind: 'shoebill-body', colors: { primary: '#64748b', secondary: '#334155', accent: '#cbd5e1' } },
  'golden-poison-frog': { kind: 'frog-body', colors: { primary: '#facc15', secondary: '#854d0e', accent: '#fde68a' } },
  axolotl: { kind: 'axolotl-body', colors: { primary: '#f9a8d4', secondary: '#be185d', accent: '#fecdd3' } },
  'red-eyed-tree-frog': { kind: 'frog-body', colors: { primary: '#22c55e', secondary: '#ef4444', accent: '#facc15' } },
  'monarch-butterfly': { kind: 'butterfly-open', colors: { primary: '#f97316', secondary: '#111827', accent: '#fde68a' } },
  'honey-bee': { kind: 'bee-body', colors: { primary: '#facc15', secondary: '#111827', accent: '#bfdbfe' } },
  'atlas-moth': { kind: 'moth-open', colors: { primary: '#b45309', secondary: '#78350f', accent: '#fcd34d' } },
  'red-kangaroo': { kind: 'kangaroo-body', colors: { primary: '#b45309', secondary: '#7c2d12', accent: '#fdba74' } },
  koala: { kind: 'koala-body', colors: { primary: '#94a3b8', secondary: '#334155', accent: '#e2e8f0' } },
  jaguar: { kind: 'cat-body', colors: { primary: '#d97706', secondary: '#111827', accent: '#fde68a' } },
  capybara: { kind: 'capybara-body', colors: { primary: '#8b5e3c', secondary: '#422006', accent: '#d6b08b' } },
  'red-panda': { kind: 'red-panda-body', colors: { primary: '#ea580c', secondary: '#7c2d12', accent: '#fef3c7' } },
  orangutan: { kind: 'orangutan-body', colors: { primary: '#ea580c', secondary: '#7c2d12', accent: '#fdba74' } },
  vaquita: { kind: 'porpoise-profile', colors: { primary: '#64748b', secondary: '#0f172a', accent: '#e2e8f0' } },
};

function svgWrap(title, body) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none">',
    `<title>${title}</title>`,
    body,
    '</svg>',
  ].join('');
}

function bearBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="126" cy="148" rx="72" ry="46" fill="${primary}"/>
    <circle cx="170" cy="102" r="30" fill="${primary}"/>
    <circle cx="156" cy="78" r="12" fill="${secondary}"/>
    <circle cx="184" cy="78" r="12" fill="${secondary}"/>
    <ellipse cx="172" cy="110" rx="14" ry="10" fill="${accent}"/>
    <circle cx="166" cy="102" r="4" fill="${secondary}"/>
    <circle cx="178" cy="102" r="4" fill="${secondary}"/>
    <circle cx="172" cy="110" r="4" fill="${secondary}"/>
    <rect x="74" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="104" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="140" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="170" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
  `;
}

function catBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="118" cy="150" rx="74" ry="40" fill="${primary}"/>
    <circle cx="178" cy="106" r="28" fill="${primary}"/>
    <path d="M160 90 170 58l18 20ZM196 90l-10-32-18 20Z" fill="${primary}"/>
    <circle cx="170" cy="106" r="4" fill="${secondary}"/>
    <circle cx="184" cy="106" r="4" fill="${secondary}"/>
    <circle cx="177" cy="116" r="4" fill="${secondary}"/>
    <path d="M50 148c-10-20-6-42 16-56" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
    <path d="M84 132h38M154 132h16" stroke="${secondary}" stroke-width="5" stroke-linecap="round"/>
    <rect x="72" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="104" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="142" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="170" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
  `;
}

function elephantAsian({ primary, secondary, accent }) {
  return `
    <ellipse cx="112" cy="150" rx="72" ry="44" fill="${primary}"/>
    <ellipse cx="174" cy="112" rx="26" ry="36" fill="${accent}"/>
    <circle cx="176" cy="102" r="26" fill="${primary}"/>
    <path d="M154 94c8-18 40-18 48 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="168" cy="100" r="4" fill="${secondary}"/>
    <path d="M184 112c0 24-4 38-20 66" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M182 116c10 8 16 18 18 28" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
    <path d="M176 122c-8 8-14 18-16 30" stroke="#f8fafc" stroke-width="5" stroke-linecap="round"/>
    <rect x="64" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="96" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="132" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="160" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
  `;
}

function elephantAfrican({ primary, secondary, accent }) {
  return `
    <ellipse cx="110" cy="150" rx="74" ry="46" fill="${primary}"/>
    <ellipse cx="162" cy="114" rx="34" ry="46" fill="${accent}"/>
    <ellipse cx="190" cy="114" rx="34" ry="46" fill="${accent}"/>
    <circle cx="178" cy="104" r="28" fill="${primary}"/>
    <circle cx="170" cy="102" r="4" fill="${secondary}"/>
    <path d="M186 114c0 24-2 42-14 72" stroke="${secondary}" stroke-width="12" stroke-linecap="round"/>
    <path d="M174 120c-8 10-12 20-14 34M188 120c10 10 16 22 18 36" stroke="#f8fafc" stroke-width="6" stroke-linecap="round"/>
    <rect x="58" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="90" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="126" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
    <rect x="156" y="170" width="16" height="42" rx="8" fill="${secondary}"/>
  `;
}

function whaleProfile({ primary, secondary, accent }) {
  return `
    <path d="M28 144c26-44 70-62 134-56 34 4 54 20 66 40-16 10-26 22-30 38-20 4-36 0-48-10-10 20-28 36-62 44-46 10-92-12-102-40-2-8 2-10 42-16Z" fill="${primary}"/>
    <path d="M156 88c18-24 38-36 64-36-8 18-12 32-10 50" fill="${primary}"/>
    <path d="M82 150c18 12 44 14 64 4" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="86" cy="118" r="6" fill="${secondary}"/>
  `;
}

function orcaProfile({ primary, secondary, accent }) {
  return `
    <path d="M30 146c22-42 70-60 132-50 38 6 56 26 64 48-12 8-22 22-24 36-18 6-36 4-52-4-10 22-30 36-64 42-44 8-90-14-100-42-2-8 4-12 44-30Z" fill="${primary}"/>
    <path d="M114 110c10-14 22-20 40-20 18 0 32 8 42 20-14 8-32 12-50 12-12 0-22-2-32-12Z" fill="${secondary}"/>
    <ellipse cx="122" cy="152" rx="30" ry="18" fill="${secondary}"/>
    <path d="M142 74c14-22 32-32 58-34-8 14-10 28-8 44" fill="${accent}"/>
    <circle cx="86" cy="120" r="6" fill="${secondary}"/>
  `;
}

function turtleTop({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="134" rx="62" ry="82" fill="${primary}"/>
    <ellipse cx="128" cy="134" rx="46" ry="62" fill="${accent}"/>
    <ellipse cx="128" cy="54" rx="18" ry="16" fill="${primary}"/>
    <ellipse cx="72" cy="102" rx="20" ry="14" transform="rotate(-30 72 102)" fill="${primary}"/>
    <ellipse cx="184" cy="102" rx="20" ry="14" transform="rotate(30 184 102)" fill="${primary}"/>
    <ellipse cx="86" cy="196" rx="20" ry="14" transform="rotate(24 86 196)" fill="${primary}"/>
    <ellipse cx="170" cy="196" rx="20" ry="14" transform="rotate(-24 170 196)" fill="${primary}"/>
    <path d="M108 108h40M100 132h56M110 156h36" stroke="${secondary}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="122" cy="54" r="4" fill="${secondary}"/>
    <circle cx="134" cy="54" r="4" fill="${secondary}"/>
  `;
}

function lizardBody({ primary, secondary, accent }) {
  return `
    <path d="M40 154c16-30 42-50 82-56 8-20 20-34 40-42 22-10 40-2 54 10-16 6-26 18-32 36 18 8 30 24 38 48-18 6-38 6-58-4-12 16-26 26-42 30-40 10-94 0-82-22Z" fill="${primary}"/>
    <path d="M122 100c12 0 24 6 36 18" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="172" cy="96" r="6" fill="${secondary}"/>
    <path d="M96 180c-8 12-18 20-32 24" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function cobraCoil({ primary, secondary, accent }) {
  return `
    <path d="M128 54c26 0 50 18 50 44 0 18-12 34-30 40 18 8 28 26 28 48 0 28-20 48-48 48s-48-20-48-48c0-22 10-40 28-48-18-6-30-22-30-40 0-26 24-44 50-44Z" fill="${primary}"/>
    <path d="M94 108c10-20 24-28 34-28M162 108c-10-20-24-28-34-28" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="118" cy="112" r="6" fill="${secondary}"/>
    <circle cx="138" cy="112" r="6" fill="${secondary}"/>
    <path d="M128 126c0 20 0 28 10 44 4 6 10 12 22 18" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M108 180c12 12 28 12 40 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function crocProfile({ primary, secondary, accent }) {
  return `
    <path d="M26 154c18-28 54-46 104-50 14-16 32-26 56-26 20 0 36 8 44 20-18 2-30 10-40 24 18 6 28 16 34 30-16 8-34 10-54 8-18 18-42 30-70 34-40 4-90-10-74-40Z" fill="${primary}"/>
    <path d="M152 118h52" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="176" cy="96" r="6" fill="${secondary}"/>
    <path d="M76 170c18 8 42 8 62 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function penguinBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="128" cy="144" rx="52" ry="78" fill="${primary}"/>
    <ellipse cx="128" cy="154" rx="32" ry="56" fill="${secondary}"/>
    <ellipse cx="128" cy="92" rx="30" ry="26" fill="${secondary}"/>
    <circle cx="118" cy="92" r="5" fill="${primary}"/>
    <circle cx="138" cy="92" r="5" fill="${primary}"/>
    <path d="M128 108 112 126h32Z" fill="${accent}"/>
    <path d="M96 196 84 214M160 196l12 18" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function eagleBody({ primary, secondary, accent }) {
  return `
    <path d="M78 182c0-46 24-82 66-96 26-8 58 8 70 32-20 4-34 16-38 34 10 8 16 20 16 34 0 26-22 46-58 54-36-2-56-24-56-58Z" fill="${primary}"/>
    <path d="M116 108c8-20 20-30 38-30 16 0 30 10 38 26-10 10-22 16-36 18-16 2-28-2-40-14Z" fill="${secondary}"/>
    <path d="M164 128h36l-20 16Z" fill="${accent}"/>
    <circle cx="146" cy="108" r="5" fill="${primary}"/>
  `;
}

function albatrossFlight({ primary, secondary, accent }) {
  return `
    <path d="M18 138c32-28 72-46 120-44l24 18c20-12 48-16 76-8-16 14-36 24-60 30-14 18-34 32-62 42-32 12-74 8-98-8Z" fill="${primary}"/>
    <path d="M124 126c20 8 44 8 72 0" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="134" cy="114" r="5" fill="${secondary}"/>
  `;
}

function shoebillBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="126" cy="144" rx="52" ry="70" fill="${primary}"/>
    <circle cx="146" cy="96" r="28" fill="${primary}"/>
    <path d="M120 110h52c-4 22-18 38-40 42-20 0-28-12-12-42Z" fill="${accent}"/>
    <circle cx="150" cy="92" r="5" fill="${secondary}"/>
    <rect x="104" y="196" width="8" height="30" rx="4" fill="${secondary}"/>
    <rect x="142" y="196" width="8" height="30" rx="4" fill="${secondary}"/>
  `;
}

function frogBody({ primary, secondary, accent }) {
  return `
    <circle cx="96" cy="86" r="20" fill="${accent}"/>
    <circle cx="160" cy="86" r="20" fill="${accent}"/>
    <ellipse cx="128" cy="138" rx="70" ry="72" fill="${primary}"/>
    <circle cx="96" cy="86" r="8" fill="${secondary}"/>
    <circle cx="160" cy="86" r="8" fill="${secondary}"/>
    <path d="M96 188 72 208M160 188l24 20M104 164 72 174M152 164l32 10" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
    <path d="M102 154c12 10 40 10 52 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function axolotlBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="122" cy="136" rx="64" ry="42" fill="${primary}"/>
    <path d="M80 106 42 84M82 120 40 120M80 134 42 156" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    <path d="M176 106 214 84M174 120l42 0M176 134l38 22" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    <path d="M148 136c24 10 34 26 40 46" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="104" cy="128" r="6" fill="${secondary}"/>
    <circle cx="136" cy="128" r="6" fill="${secondary}"/>
    <path d="M106 150c10 8 22 8 32 0" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function butterflyOpen({ primary, secondary, accent }) {
  return `
    <path d="M124 128c-14-34-44-68-82-68-18 0-32 14-32 32 0 40 32 70 86 74l28-38Z" fill="${primary}"/>
    <path d="M132 128c14-34 44-68 82-68 18 0 32 14 32 32 0 40-32 70-86 74l-28-38Z" fill="${primary}"/>
    <path d="M124 132c-12 30-34 62-68 68-22 4-38-8-40-30-2-28 20-48 62-54l46 16Z" fill="${accent}"/>
    <path d="M132 132c12 30 34 62 68 68 22 4 38-8 40-30 2-28-20-48-62-54l-46 16Z" fill="${accent}"/>
    <path d="M128 82v102" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M126 80 112 56M130 80l14-24" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
  `;
}

function mothOpen({ primary, secondary, accent }) {
  return `
    <path d="M124 128c-14-32-42-60-78-60-20 0-34 14-34 30 0 38 30 66 82 70l30-40Z" fill="${primary}"/>
    <path d="M132 128c14-32 42-60 78-60 20 0 34 14 34 30 0 38-30 66-82 70l-30-40Z" fill="${primary}"/>
    <path d="M124 132c-12 26-34 56-68 60-22 2-38-10-40-30-2-24 20-42 60-48l48 18Z" fill="${accent}"/>
    <path d="M132 132c12 26 34 56 68 60 22 2 38-10 40-30 2-24-20-42-60-48l-48 18Z" fill="${accent}"/>
    <path d="M128 86v98" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="116" cy="126" r="4" fill="${secondary}"/>
    <circle cx="140" cy="126" r="4" fill="${secondary}"/>
  `;
}

function beeBody({ primary, secondary, accent }) {
  return `
    <path d="M84 118c-20-20-42-26-60-18 0 24 16 42 42 48ZM172 118c20-20 42-26 60-18 0 24-16 42-42 48Z" fill="${accent}"/>
    <ellipse cx="128" cy="144" rx="48" ry="58" fill="${primary}"/>
    <path d="M94 126h68M92 148h72M100 170h56" stroke="${secondary}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="116" cy="116" r="6" fill="${secondary}"/>
    <circle cx="140" cy="116" r="6" fill="${secondary}"/>
    <path d="M120 92 108 70M136 92l12-22" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
  `;
}

function kangarooBody({ primary, secondary, accent }) {
  return `
    <path d="M74 186c0-52 28-96 70-112 18-8 40 0 54 18-20 4-34 18-38 40 20 8 32 26 32 48 0 26-18 46-46 52-16 4-30-2-44-16v18H74Z" fill="${primary}"/>
    <path d="M126 88 148 44l16 34" fill="${primary}"/>
    <circle cx="152" cy="100" r="6" fill="${secondary}"/>
    <path d="M88 166c-16 10-28 20-36 36" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/>
    <path d="M154 146c10 10 20 12 34 4" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function koalaBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="104" cy="142" rx="54" ry="62" fill="${primary}"/>
    <ellipse cx="98" cy="92" rx="22" ry="26" fill="${accent}"/>
    <ellipse cx="156" cy="92" rx="22" ry="26" fill="${accent}"/>
    <circle cx="128" cy="112" r="34" fill="${primary}"/>
    <ellipse cx="128" cy="122" rx="18" ry="20" fill="${secondary}"/>
    <circle cx="118" cy="106" r="5" fill="${secondary}"/>
    <circle cx="138" cy="106" r="5" fill="${secondary}"/>
    <rect x="168" y="72" width="18" height="150" rx="9" fill="${accent}"/>
    <path d="M146 144c12 4 22 12 30 24M94 154c10 6 18 14 22 26" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
  `;
}

function capybaraBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="116" cy="150" rx="74" ry="42" fill="${primary}"/>
    <circle cx="174" cy="112" r="30" fill="${primary}"/>
    <ellipse cx="160" cy="88" rx="12" ry="14" fill="${accent}"/>
    <circle cx="182" cy="108" r="5" fill="${secondary}"/>
    <path d="M188 132c8 8 18 10 28 2" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>
    <rect x="68" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="102" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="136" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
    <rect x="166" y="170" width="14" height="38" rx="7" fill="${secondary}"/>
  `;
}

function redPandaBody({ primary, secondary, accent }) {
  return `
    <ellipse cx="116" cy="148" rx="70" ry="40" fill="${primary}"/>
    <circle cx="174" cy="110" r="30" fill="${primary}"/>
    <path d="M154 96 168 62l18 20ZM194 96l-14-34-18 20Z" fill="${primary}"/>
    <path d="M160 114c8-10 22-14 28-14M188 114c-8-10-22-14-28-14" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="166" cy="110" r="4" fill="${secondary}"/>
    <circle cx="182" cy="110" r="4" fill="${secondary}"/>
    <circle cx="174" cy="120" r="4" fill="${secondary}"/>
    <path d="M44 164c26 0 40 8 58 28" stroke="${accent}" stroke-width="14" stroke-linecap="round"/>
  `;
}

function orangutanBody({ primary, secondary, accent }) {
  return `
    <circle cx="138" cy="108" r="34" fill="${primary}"/>
    <ellipse cx="138" cy="116" rx="20" ry="24" fill="${secondary}"/>
    <ellipse cx="102" cy="112" rx="24" ry="34" fill="${accent}"/>
    <ellipse cx="174" cy="112" rx="24" ry="34" fill="${accent}"/>
    <path d="M86 126c-24 26-30 44-32 76M190 126c24 26 30 44 32 76" stroke="${primary}" stroke-width="16" stroke-linecap="round"/>
    <path d="M116 154c8 10 16 28 18 54M160 154c-8 10-16 28-18 54" stroke="${primary}" stroke-width="14" stroke-linecap="round"/>
    <circle cx="130" cy="108" r="5" fill="#f8fafc"/>
    <circle cx="146" cy="108" r="5" fill="#f8fafc"/>
  `;
}

function porpoiseProfile({ primary, secondary, accent }) {
  return `
    <path d="M34 146c24-38 64-56 120-50 34 2 56 16 68 36-12 8-20 18-26 30-18 4-34 4-48-2-10 20-26 32-58 40-42 8-88-10-96-38-2-8 2-10 40-16Z" fill="${primary}"/>
    <path d="M148 86c16-22 34-32 58-32-8 14-12 28-10 44" fill="${accent}"/>
    <path d="M84 148c18 10 40 10 58 2" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="86" cy="118" r="6" fill="${secondary}"/>
  `;
}

const DRAWERS = {
  'bear-body': bearBody,
  'cat-body': catBody,
  'elephant-asian': elephantAsian,
  'elephant-african': elephantAfrican,
  'whale-profile': whaleProfile,
  'orca-profile': orcaProfile,
  'turtle-top': turtleTop,
  'lizard-body': lizardBody,
  'cobra-coil': cobraCoil,
  'croc-profile': crocProfile,
  'penguin-body': penguinBody,
  'eagle-body': eagleBody,
  'albatross-flight': albatrossFlight,
  'shoebill-body': shoebillBody,
  'frog-body': frogBody,
  'axolotl-body': axolotlBody,
  'butterfly-open': butterflyOpen,
  'moth-open': mothOpen,
  'bee-body': beeBody,
  'kangaroo-body': kangarooBody,
  'koala-body': koalaBody,
  'capybara-body': capybaraBody,
  'red-panda-body': redPandaBody,
  'orangutan-body': orangutanBody,
  'porpoise-profile': porpoiseProfile,
};

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const species of speciesList) {
    const config = ICON_CONFIG[species.id];
    if (!config) throw new Error(`Missing icon config for ${species.id}`);

    const draw = DRAWERS[config.kind];
    if (!draw) throw new Error(`Missing drawer for ${config.kind}`);

    const svg = svgWrap(species.nameEn, draw(config.colors));
    const outputPath = path.join(OUTPUT_DIR, `species-${species.id}.svg`);
    await fs.writeFile(outputPath, `${svg}\n`, 'utf8');
    console.log(`generated ${path.relative(process.cwd(), outputPath)}`);
  }
}

main();
