import { speciesList } from './species.js';
import { generatedSpeciesMediaImages } from './speciesMedia.generated.js';

const ICON_STYLE_VERSION = 'orbital-badge-v1';
const ICON_BASE_PATH = '/src/assets/species-icons';

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
      'Prefer a full-body or signature posture over a close-up head when that silhouette is more recognizable.',
      'Keep the animal readable at 48px size with 2-4 flat fills, one subtle accent stroke, and no scenery.',
      'Preserve a compact circular composition for a dark globe UI.',
    ].join(' '),
    ...overrides,
  };
}

export const speciesMediaMap = Object.fromEntries(
  speciesList.map((species) => [
    species.id,
    {
      icon: buildIconSpec(species),
      images: generatedSpeciesMediaImages[species.id] ?? [],
    },
  ])
);

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
