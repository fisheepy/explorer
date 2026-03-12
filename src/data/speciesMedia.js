import { speciesList } from './species.js';

const ICON_STYLE_VERSION = 'orbital-badge-v1';
const ICON_BASE_PATH = '/src/assets/species-icons';

const speciesById = Object.fromEntries(speciesList.map((species) => [species.id, species]));

function buildIconSpec(species, overrides = {}) {
  return {
    strategy: 'svg-system',
    style: ICON_STYLE_VERSION,
    assetName: `species-${species.id}.svg`,
    assetPath: `${ICON_BASE_PATH}/species-${species.id}.svg`,
    version: 'v1',
    viewport: '256x256',
    prompt: [
      `Create a clean SVG wildlife icon for ${species.nameEn}.`,
      'Use the orbital-badge-v1 system: centered subject, transparent background, bold silhouette, limited detail.',
      'Keep the animal facing slightly left or front-left, with a readable head or body landmark at 48px size.',
      'Use 2-4 flat fills, one subtle accent stroke, and avoid text, gradients, photo texture, or scenery.',
      'Preserve a compact circular composition for a dark globe UI.',
    ].join(' '),
    ...overrides,
  };
}

const defaultMediaEntries = Object.fromEntries(
  speciesList.map((species) => [
    species.id,
    {
      icon: buildIconSpec(species),
      images: [],
    },
  ])
);

const seededMediaEntries = {
  'giant-panda': {
    icon: buildIconSpec(speciesById['giant-panda'], {
      prompt: [
        'Create a clean SVG wildlife icon for Giant Panda.',
        'Use orbital-badge-v1 with a front-left panda face, black ear patches, black eye patches, white muzzle, and rounded cheeks.',
        'Keep the silhouette compact, high-contrast, and readable at small size.',
      ].join(' '),
    }),
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Grosser_Panda.JPG',
        source: 'wikimedia',
        author: 'Michael Gotte',
        license: 'CC BY-SA 3.0',
        attribution: 'Wikimedia Commons / Michael Gotte',
        isPrimary: true,
      },
    ],
  },
  'snow-leopard': {
    icon: buildIconSpec(speciesById['snow-leopard'], {
      prompt: [
        'Create a clean SVG wildlife icon for Snow Leopard.',
        'Use orbital-badge-v1 with a front-left snow leopard head, pale gray fur, dark rosettes, and sharp eyes.',
        'Keep the shape crisp, cool-toned, and readable at small size.',
      ].join(' '),
    }),
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Irbis4.JPG',
        source: 'wikimedia',
        author: 'Dmitry Medvedev',
        license: 'CC BY-SA 2.0',
        attribution: 'Wikimedia Commons / Dmitry Medvedev',
        isPrimary: true,
      },
    ],
  },
  'blue-whale': {
    icon: buildIconSpec(speciesById['blue-whale'], {
      prompt: [
        'Create a clean SVG wildlife icon for Blue Whale.',
        'Use orbital-badge-v1 with a left-facing whale side profile, deep ocean blue body, pale belly, and a broad head silhouette.',
        'Keep the form elegant, minimal, and readable at small size.',
      ].join(' '),
    }),
    images: [
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Anim1754%20-%20Flickr%20-%20NOAA%20Photo%20Library.jpg',
        source: 'wikimedia',
        author: 'NOAA Photo Library',
        license: 'Public Domain',
        attribution: 'NOAA Photo Library',
        isPrimary: true,
      },
    ],
  },
  orangutan: {
    icon: buildIconSpec(speciesById.orangutan, {
      prompt: [
        'Create a clean SVG wildlife icon for Orangutan.',
        'Use orbital-badge-v1 with a front-left orangutan face, long orange cheek fur, dark face plate, and warm amber palette.',
        'Keep the silhouette rounded and expressive without realistic hair texture.',
      ].join(' '),
    }),
    images: [
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/SUMATRAN%20ORANGUTAN.jpg',
        source: 'wikimedia',
        author: 'Rizki Agung Pratama',
        license: 'CC BY-SA 4.0',
        attribution: 'Wikimedia Commons / Rizki Agung Pratama',
        isPrimary: true,
      },
      {
        url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sumatra%20Orangutan.jpg',
        source: 'wikimedia',
        author: 'William Warby',
        license: 'CC BY 2.0',
        attribution: 'Wikimedia Commons / William Warby',
      },
    ],
  },
};

export const speciesMediaMap = {
  ...defaultMediaEntries,
  ...seededMediaEntries,
};

export const speciesIconSystem = {
  version: ICON_STYLE_VERSION,
  basePath: ICON_BASE_PATH,
  naming: {
    primary: 'species-<species-id>.svg',
    variants: [
      'species-<species-id>--badge.svg',
      'species-<species-id>--mono.svg',
      'species-<species-id>--outline.svg',
    ],
  },
};
