import { useEffect, useMemo, useRef, useState } from 'react';
import GlobeScene from './GlobeScene';
import { riskLegend, speciesFocusMap, speciesList, speciesNativeRanges } from './data/species';
import { speciesIconAssetMap } from './data/speciesIconAssets';
import { speciesCardContentMap } from './data/speciesCardContent';
import { buildFallbackPoints, buildRangePolygon, clusterDistributionPoints, fetchGbifOccurrences } from './services/gbif';
import { speciesMediaMap } from './data/speciesMedia';

const riskLabelsEn = {
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
  DD: 'Data Deficient',
  NE: 'Not Evaluated',
};

const rainbowCardThemes = [
  'linear-gradient(145deg, rgba(255, 99, 132, 0.92), rgba(255, 159, 64, 0.84))',
  'linear-gradient(145deg, rgba(255, 189, 46, 0.92), rgba(134, 239, 172, 0.82))',
  'linear-gradient(145deg, rgba(56, 189, 248, 0.9), rgba(59, 130, 246, 0.84))',
  'linear-gradient(145deg, rgba(129, 140, 248, 0.92), rgba(236, 72, 153, 0.84))',
  'linear-gradient(145deg, rgba(45, 212, 191, 0.9), rgba(16, 185, 129, 0.84))',
  'linear-gradient(145deg, rgba(244, 114, 182, 0.9), rgba(168, 85, 247, 0.82))',
];

function getCardTheme(speciesId) {
  const seed = Array.from(speciesId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return rainbowCardThemes[seed % rainbowCardThemes.length];
}

function SpeciesCard({ species, faded = false }) {
  const risk = riskLegend[species.riskLevel] ?? riskLegend.DD;
  const cardContent = speciesCardContentMap[species.id] ?? {
    category: species.category,
    intro: species.intro,
  };

  return (
    <article
      className={`species-card carousel-card ${faded ? 'faded' : ''}`}
      style={{ '--card-gradient': getCardTheme(species.id) }}
    >
      <div className="species-card-top">
        <p className="species-zh">{species.nameZh}</p>
        <span className="risk-badge" style={{ backgroundColor: risk.color }}>
          {species.riskLevel} · {riskLabelsEn[species.riskLevel] ?? risk.label}
        </span>
      </div>
      <p className="species-en">{species.nameEn}</p>
      <p className="species-latin">{species.latinName}</p>
      <p className="species-category">{cardContent.category}</p>
      <p className="species-intro">{cardContent.intro}</p>
    </article>
  );
}

function filterPointsByNativeRange(points, nativeRange) {
  if (!nativeRange) return points;
  return points.filter(
    (point) =>
      point.lat >= nativeRange.minLat &&
      point.lat <= nativeRange.maxLat &&
      point.lon >= nativeRange.minLon &&
      point.lon <= nativeRange.maxLon
  );
}

function clampIndex(value, size) {
  if (size <= 0) return 0;
  return Math.max(0, Math.min(size - 1, value));
}

function getPrimaryFocus(clusters, fallbackFocus) {
  if (!clusters || clusters.length === 0) return fallbackFocus ?? null;
  const main = [...clusters].sort((a, b) => b.count - a.count)[0];
  if (!main) return fallbackFocus ?? null;
  return { lat: main.lat, lon: main.lon, strength: main.count };
}

function App() {
  const audioContextRef = useRef(null);
  const masterGainRef = useRef(null);
  const audioNodesRef = useRef([]);
  const [selectedId, setSelectedId] = useState(speciesList[0].id);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [touchStartX, setTouchStartX] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [distribution, setDistribution] = useState({
    points: [],
    clusters: [],
    range: null,
    focus: null,
    source: 'loading',
    gbifTaxonKey: null,
    speciesId: speciesList[0].id,
  });

  const categories = useMemo(
    () => ['ALL', ...new Set(speciesList.map((species) => species.category.split('·')[0].trim()))],
    []
  );

  const filteredSpecies = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return speciesList.filter((species) => {
      const hitKeyword =
        keyword.length === 0 ||
        species.nameZh.includes(keyword) ||
        species.nameEn.toLowerCase().includes(keyword) ||
        species.latinName.toLowerCase().includes(keyword);
      const hitRisk = riskFilter === 'ALL' || species.riskLevel === riskFilter;
      const hitCategory = categoryFilter === 'ALL' || species.category.startsWith(categoryFilter);
      return hitKeyword && hitRisk && hitCategory;
    });
  }, [search, riskFilter, categoryFilter]);

  const selectedIndex = useMemo(
    () => Math.max(0, filteredSpecies.findIndex((species) => species.id === selectedId)),
    [filteredSpecies, selectedId]
  );

  useEffect(() => {
    if (!filteredSpecies.some((species) => species.id === selectedId) && filteredSpecies.length > 0) {
      setSelectedId(filteredSpecies[0].id);
    }
  }, [filteredSpecies, selectedId]);

  const selectedSpecies = filteredSpecies[selectedIndex] ?? filteredSpecies[0] ?? speciesList[0];
  const prevSpecies = filteredSpecies[selectedIndex - 1] ?? null;
  const nextSpecies = filteredSpecies[selectedIndex + 1] ?? null;
  const visualSpeciesId = distribution.speciesId ?? selectedSpecies?.id;

  const selectedMedia = selectedSpecies ? speciesMediaMap[selectedSpecies.id] : null;
  const visualMedia = visualSpeciesId ? speciesMediaMap[visualSpeciesId] : null;

  const selectedPreviewImages = useMemo(() => {
    if (!selectedMedia?.images?.length) return [];

    const ordered = [
      ...selectedMedia.images.filter((item) => item.isPrimary),
      ...selectedMedia.images.filter((item) => !item.isPrimary),
    ];

    return ordered.filter((item, index) => ordered.findIndex((candidate) => candidate.url === item.url) === index);
  }, [selectedMedia]);

  const selectedIconUrl = visualMedia?.icon?.assetName ? speciesIconAssetMap[visualMedia.icon.assetName] ?? null : null;

  useEffect(() => {
    if (!selectedSpecies) {
      setDistribution({
        points: [],
        clusters: [],
        range: null,
        focus: null,
        source: 'empty',
        gbifTaxonKey: null,
        speciesId: null,
      });
      setIsSwitching(false);
      return;
    }

    const controller = new AbortController();
    let timeoutId;
    let cancelled = false;
    const startTime = performance.now();

    setIsSwitching(true);

    const commitDistribution = (nextDistribution) => {
      const elapsed = performance.now() - startTime;
      const bufferMs = Math.max(220 - elapsed, 0);
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        setDistribution(nextDistribution);
        setIsSwitching(false);
      }, bufferMs);
    };

    fetchGbifOccurrences(selectedSpecies.latinName, controller.signal)
      .then((payload) => {
        const rawPoints = payload.points.slice(0, 320);
        const nativeRange = speciesNativeRanges[selectedSpecies.id];
        const points = filterPointsByNativeRange(rawPoints, nativeRange);
        if (points.length < 20) throw new Error('GBIF points not enough after native-range filtering');

        const clusters = clusterDistributionPoints(points, 6, 150);
        commitDistribution({
          points,
          clusters,
          range: buildRangePolygon(points),
          focus: getPrimaryFocus(clusters, speciesFocusMap[selectedSpecies.id]),
          source: 'gbif',
          gbifTaxonKey: payload.gbifTaxonKey,
          speciesId: selectedSpecies.id,
        });
      })
      .catch(() => {
        const fallback = buildFallbackPoints(speciesFocusMap[selectedSpecies.id]);
        const clusters = clusterDistributionPoints(fallback, 5, 80);
        commitDistribution({
          points: fallback,
          clusters,
          range: buildRangePolygon(fallback),
          focus: getPrimaryFocus(clusters, speciesFocusMap[selectedSpecies.id]),
          source: 'fallback',
          gbifTaxonKey: null,
          speciesId: selectedSpecies.id,
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [selectedSpecies]);

  const changeByOffset = (offset) => {
    if (filteredSpecies.length === 0) return;
    const nextIndex = clampIndex(selectedIndex + offset, filteredSpecies.length);
    setSelectedId(filteredSpecies[nextIndex].id);
  };

  const onTouchStart = (event) => setTouchStartX(event.changedTouches[0].clientX);
  const onTouchEnd = (event) => {
    if (touchStartX == null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) >= 30) changeByOffset(delta < 0 ? 1 : -1);
    setTouchStartX(null);
  };

  const statusText = isSwitching
    ? 'Switching species: loading a fresh range map...'
    : distribution.source === 'gbif'
      ? `GBIF: ${distribution.points.length} raw points, ${distribution.clusters.length} clusters`
      : distribution.source === 'fallback'
        ? `Fallback map: ${distribution.points.length} raw points, ${distribution.clusters.length} clusters`
        : 'No range data yet.';

  const displayClusters = isSwitching ? [] : distribution.clusters;
  const displayRange = isSwitching ? null : distribution.range;
  const displayFocus = isSwitching ? null : distribution.focus;
  const displayPreviewImages = isSwitching ? [] : selectedPreviewImages;
  const displayIconUrl = isSwitching ? null : selectedIconUrl;

  useEffect(() => {
    return () => {
      audioNodesRef.current.forEach((node) => {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      });
      audioNodesRef.current = [];
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  function detuneDrift(gain, oscillator, context, index) {
    const now = context.currentTime;
    oscillator.detune.setValueAtTime(index * 3, now);
    oscillator.detune.linearRampToValueAtTime(index % 2 === 0 ? 9 : -7, now + 14);
    oscillator.detune.linearRampToValueAtTime(index * 3, now + 28);

    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(gain.gain.value * 0.72, now + 9);
    gain.gain.linearRampToValueAtTime(gain.gain.value, now + 18);
  }

  const ensureAmbientAudio = async () => {
    if (typeof window === 'undefined') return false;

    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;

      const context = new AudioContextClass();
      const masterGain = context.createGain();
      masterGain.gain.value = 0.035;
      masterGain.connect(context.destination);

      const chord = [
        { frequency: 196, type: 'sine', gain: 0.36 },
        { frequency: 246.94, type: 'triangle', gain: 0.18 },
        { frequency: 293.66, type: 'sine', gain: 0.12 },
      ];

      const nodes = chord.flatMap((tone, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = tone.type;
        oscillator.frequency.value = tone.frequency;
        detuneDrift(gain, oscillator, context, index);

        gain.gain.value = tone.gain;
        oscillator.connect(gain);
        gain.connect(masterGain);
        oscillator.start();

        return [oscillator, gain];
      });

      audioContextRef.current = context;
      masterGainRef.current = masterGain;
      audioNodesRef.current = nodes;
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return true;
  };
  const toggleAudio = async () => {
    const ready = await ensureAmbientAudio();
    if (!ready || !masterGainRef.current) return;

    const nextEnabled = !audioEnabled;
    const now = audioContextRef.current.currentTime;
    masterGainRef.current.gain.cancelScheduledValues(now);
    masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
    masterGainRef.current.gain.linearRampToValueAtTime(nextEnabled ? 0.035 : 0, now + 0.6);
    setAudioEnabled(nextEnabled);
  };

  return (
    <main className="space-page">
      <section className="filter-row" aria-label="filters">
        <input
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search: Chinese name / English / Latin"
        />
        <select className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'ALL' ? 'All categories' : category}
            </option>
          ))}
        </select>
        <select className="filter-select" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
          <option value="ALL">All risk levels</option>
          {Object.entries(riskLegend).map(([code, meta]) => (
            <option key={code} value={code}>
              {code} · {riskLabelsEn[code] ?? meta.label}
            </option>
          ))}
        </select>
      </section>

      <section className="globe-wrap">
        <GlobeScene
          distributionClusters={displayClusters}
          rangePolygon={displayRange}
          speciesIconUrl={displayIconUrl}
          speciesIconLabel={selectedSpecies?.nameEn ?? selectedSpecies?.nameZh ?? ''}
          autoFocusTarget={displayFocus}
          previewImages={displayPreviewImages}
          previewTitle={selectedSpecies?.nameEn ?? selectedSpecies?.nameZh ?? ''}
        />
      </section>

      <section className="overlay-panel" aria-label="species cards">
        <div className="overlay-title-row compact">
          <h2>
            {selectedSpecies?.nameZh ?? 'No Species Selected'} · {selectedIndex + 1}/{Math.max(filteredSpecies.length, 1)}
          </h2>
          <div className="overlay-meta">
            <p>{statusText}</p>
            <button type="button" className="audio-toggle" onClick={toggleAudio}>
              {audioEnabled ? 'Music On' : 'Music Off'}
            </button>
          </div>
        </div>

        <div className="carousel-actions">
          <button type="button" onClick={() => changeByOffset(-1)}>
            ← Previous
          </button>
          <button type="button" onClick={() => changeByOffset(1)}>
            Next →
          </button>
        </div>

        <div className="species-carousel-compact" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="side-preview" onClick={() => prevSpecies && setSelectedId(prevSpecies.id)}>
            {prevSpecies ? <SpeciesCard species={prevSpecies} faded /> : <div className="empty-preview" />}
          </div>

          <div className="center-current">
            {selectedSpecies ? <SpeciesCard species={selectedSpecies} /> : <div className="empty-preview" />}
          </div>

          <div className="side-preview" onClick={() => nextSpecies && setSelectedId(nextSpecies.id)}>
            {nextSpecies ? <SpeciesCard species={nextSpecies} faded /> : <div className="empty-preview" />}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
