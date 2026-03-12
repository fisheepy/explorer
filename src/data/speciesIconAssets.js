const iconModules = import.meta.glob('../assets/species-icons/*.svg', {
  eager: true,
  import: 'default',
});

export const speciesIconAssetMap = Object.fromEntries(
  Object.entries(iconModules).map(([modulePath, assetUrl]) => [modulePath.split('/').pop(), assetUrl])
);
