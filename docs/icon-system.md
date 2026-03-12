# SVG Icon System

## Style

- System name: `orbital-badge-v1`
- Format: plain SVG, transparent background
- Viewport: `256 x 256`
- Composition: one centered animal inside a compact circular footprint
- Readability target: still identifiable at `48 x 48`
- Detail level: bold silhouette first, 2-4 flat fills, one subtle stroke at most
- Perspective: front-left or left-facing, avoid dramatic angles
- Background elements: none
- Text: none
- Effects to avoid: photo texture, heavy gradients, drop shadows, scenery

## Visual rules

- Prefer the most recognizable landmark of the animal:
  - Mammals: face, ear shape, muzzle, tusk, cheek fur
  - Birds: beak, crest, neck profile
  - Reptiles: jawline, shell, hood, snout
  - Amphibians: eye shape, toe spread, body silhouette
  - Marine animals: dorsal outline, fin profile, head shape
  - Insects: wing silhouette, antenna, body segmentation
- Keep the silhouette closed and compact. Avoid thin appendages that vanish at small size.
- Use species-appropriate base colors, but clamp saturation so the full icon set feels coherent.
- Leave 12-16% padding around the subject inside the viewport.
- If the full body is not readable, prefer head-and-shoulder or bust framing.

## Naming

- Primary asset: `species-<species-id>.svg`
- Optional badge variant: `species-<species-id>--badge.svg`
- Optional mono variant: `species-<species-id>--mono.svg`
- Optional outline variant: `species-<species-id>--outline.svg`
- `<species-id>` must exactly match `speciesList[].id`

Examples:

- `species-giant-panda.svg`
- `species-snow-leopard.svg`
- `species-orangutan.svg`
- `species-orangutan--mono.svg`

## Location

- Source of truth folder: `src/assets/species-icons/`
- Metadata entry: `src/data/speciesMedia.js`
- Every icon metadata entry should include:
  - `style`
  - `assetName`
  - `assetPath`
  - `version`
  - `prompt`

## Workflow

1. Create the SVG using `orbital-badge-v1`.
2. Save it as `src/assets/species-icons/species-<species-id>.svg`.
3. If needed, create variant files using the suffix rules above.
4. Update `speciesMediaMap[speciesId].icon` only if the prompt or path differs from the default template.
5. Keep prompts short and system-based. Avoid one-off art direction unless the species really needs it.
