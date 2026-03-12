import { speciesList } from './species';

const defaultMediaEntries = Object.fromEntries(
  speciesList.map((species) => [
    species.id,
    {
      icon: {
        strategy: 'llm-generated',
        style: 'cartoon',
        prompt: `Create a clean ${species.nameEn} icon for a dark globe UI, transparent background, centered, high contrast.`,
      },
      images: [],
    },
  ])
);

const seededMediaEntries = {
  'giant-panda': {
    icon: {
      strategy: 'llm-generated',
      style: 'cartoon',
      prompt:
        'Cute but realistic giant panda face icon, black and white fur, transparent background, optimized for dark-space UI.',
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Grosser_Panda.JPG',
        source: 'wikimedia',
        author: 'Michael Götte',
        license: 'CC BY-SA 3.0',
        attribution: 'Wikimedia Commons / Michael Götte',
        isPrimary: true,
      },
    ],
  },
  'snow-leopard': {
    icon: {
      strategy: 'llm-generated',
      style: 'cartoon',
      prompt: 'Snow leopard icon, cool-toned fur pattern, transparent background, sharp eyes, clean vector style.',
    },
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
    icon: {
      strategy: 'llm-generated',
      style: 'realistic',
      prompt: 'Blue whale side-profile icon, deep ocean blue palette, transparent background, minimal but realistic style.',
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg',
        source: 'wikimedia',
        author: 'NOAA Photo Library',
        license: 'Public Domain',
        attribution: 'NOAA Photo Library',
        isPrimary: true,
      },
    ],
  },
  orangutan: {
    icon: {
      strategy: 'llm-generated',
      style: 'cartoon',
      prompt: 'Orangutan icon with orange fur and expressive face, transparent background, rounded shape for tablet UI.',
    },
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Sumatran_Orangutan_%28Pongo_abelii%29.jpg',
        source: 'wikimedia',
        author: 'Rizki Agung Pratama',
        license: 'CC BY-SA 4.0',
        attribution: 'Wikimedia Commons / Rizki Agung Pratama',
        isPrimary: true,
      },
    ],
  },
};

export const speciesMediaMap = {
  ...defaultMediaEntries,
  ...seededMediaEntries,
};
