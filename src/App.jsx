import { useEffect, useMemo, useState } from 'react';
import GlobeScene from './GlobeScene';
import { riskLegend, speciesFocusMap, speciesList, speciesNativeRanges } from './data/species';
import { buildFallbackPoints, buildRangePolygon, clusterDistributionPoints, fetchGbifOccurrences } from './services/gbif';
import { speciesMediaMap } from './data/speciesMedia';

function SpeciesCard({ species, faded = false }) {
  const risk = riskLegend[species.riskLevel] ?? riskLegend.DD;

  return (
    <article className={`species-card carousel-card ${faded ? 'faded' : ''}`}>
      <div className="species-card-top">
        <p className="species-zh">{species.nameZh}</p>
        <span className="risk-badge" style={{ backgroundColor: risk.color }}>
          {species.riskLevel} · {risk.label}
        </span>
      </div>
      <p className="species-en">{species.nameEn}</p>
      <p className="species-latin">{species.latinName}</p>
      <p className="species-category">{species.category}</p>
      <p className="species-intro">{species.intro}</p>
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

function orderMediaImages(images = []) {
  if (!images.length) return [];

  const ordered = [
    ...images.filter((item) => item.isPrimary),
    ...images.filter((item) => !item.isPrimary),
  ];

  return ordered.filter((item, index) => ordered.findIndex((candidate) => candidate.url === item.url) === index);
}

function App() {
  const [selectedId, setSelectedId] = useState(speciesList[0].id);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [touchStartX, setTouchStartX] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);

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

  const selectedPreviewImages = useMemo(() => orderMediaImages(selectedMedia?.images), [selectedMedia]);
  const visualMarkerImages = useMemo(() => orderMediaImages(visualMedia?.images), [visualMedia]);
  const selectedIconUrl = visualMarkerImages[0]?.url ?? null;

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
    ? '切换中：正在缓冲新物种分布...'
    : distribution.source === 'gbif'
      ? `GBIF：原始点 ${distribution.points.length}，聚簇 ${distribution.clusters.length}`
      : distribution.source === 'fallback'
        ? `fallback：原始点 ${distribution.points.length}，聚簇 ${distribution.clusters.length}`
        : '暂无分布数据';

  const displayClusters = isSwitching ? [] : distribution.clusters;
  const displayRange = isSwitching ? null : distribution.range;
  const displayFocus = isSwitching ? null : distribution.focus;
  const displayPreviewImages = isSwitching ? [] : selectedPreviewImages;
  const displayIconUrl = isSwitching ? null : selectedIconUrl;

  return (
    <main className="space-page">
      <header className="space-header">
        <p className="badge">World Theme Explorer · iPad Compact</p>
        <h1>单卡主视图 + 前后淡化预览</h1>
        <p>地球区域显示分布图标，点击图标出现图片，再点图片关闭。</p>
      </header>

      <section className="filter-row">
        <input
          className="filter-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="搜索：中文名 / English / Latin"
        />
        <select className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'ALL' ? '全部分类' : category}
            </option>
          ))}
        </select>
        <select className="filter-select" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
          <option value="ALL">全部风险</option>
          {Object.entries(riskLegend).map(([code, meta]) => (
            <option key={code} value={code}>
              {code} · {meta.label}
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
            {selectedSpecies?.nameZh ?? '未选择物种'} · {selectedIndex + 1}/{Math.max(filteredSpecies.length, 1)}
          </h2>
          <p>{statusText}</p>
        </div>

        <div className="carousel-actions">
          <button type="button" onClick={() => changeByOffset(-1)}>
            ← 上一个
          </button>
          <button type="button" onClick={() => changeByOffset(1)}>
            下一个 →
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
