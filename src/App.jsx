import { useEffect, useMemo, useRef, useState } from 'react';
import GlobeScene from './GlobeScene';
import { riskLegend, speciesFocusMap, speciesIconMap, speciesList, speciesNativeRanges } from './data/species';
import { buildFallbackPoints, buildRangePolygon, clusterDistributionPoints, fetchGbifOccurrences } from './services/gbif';

function SpeciesCard({ species }) {
  const risk = riskLegend[species.riskLevel] ?? riskLegend.DD;

  return (
    <article className="species-card carousel-card">
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
  if (!nativeRange) {
    return points;
  }

  return points.filter(
    (point) =>
      point.lat >= nativeRange.minLat &&
      point.lat <= nativeRange.maxLat &&
      point.lon >= nativeRange.minLon &&
      point.lon <= nativeRange.maxLon
  );
}

function clampIndex(value, size) {
  if (size <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(size - 1, value));
}

function App() {
  const [selectedId, setSelectedId] = useState(speciesList[0].id);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [distribution, setDistribution] = useState({ points: [], clusters: [], range: null, source: 'loading', gbifTaxonKey: null });
  const [touchStartX, setTouchStartX] = useState(null);
  const carouselRef = useRef(null);

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

  const selectedSpecies =
    filteredSpecies.find((species) => species.id === selectedId) ?? filteredSpecies[0] ?? speciesList[0];

  useEffect(() => {
    if (!selectedSpecies) {
      setDistribution({ points: [], clusters: [], range: null, source: 'empty', gbifTaxonKey: null });
      return;
    }

    const controller = new AbortController();
    setDistribution((current) => ({ ...current, source: 'loading' }));

    fetchGbifOccurrences(selectedSpecies.latinName, controller.signal)
      .then((payload) => {
        const rawPoints = payload.points.slice(0, 320);
        const nativeRange = speciesNativeRanges[selectedSpecies.id];
        const points = filterPointsByNativeRange(rawPoints, nativeRange);

        if (points.length < 20) {
          throw new Error('GBIF points not enough after native-range filtering');
        }

        const clusters = clusterDistributionPoints(points, 6, 150);
        setDistribution({
          points,
          clusters,
          range: buildRangePolygon(points),
          source: 'gbif',
          gbifTaxonKey: payload.gbifTaxonKey,
        });
      })
      .catch(() => {
        const fallback = buildFallbackPoints(speciesFocusMap[selectedSpecies.id]);
        const clusters = clusterDistributionPoints(fallback, 5, 80);
        setDistribution({
          points: fallback,
          clusters,
          range: buildRangePolygon(fallback),
          source: 'fallback',
          gbifTaxonKey: null,
        });
      });

    return () => controller.abort();
  }, [selectedSpecies]);

  const statusText =
    distribution.source === 'loading'
      ? '正在加载 GBIF 分布点位...'
      : distribution.source === 'gbif'
        ? `来源：GBIF（原始点 ${distribution.points.length}，聚簇图标 ${distribution.clusters.length}）`
        : distribution.source === 'fallback'
          ? `来源：本地 fallback（原始点 ${distribution.points.length}，聚簇图标 ${distribution.clusters.length}）`
          : '暂无分布数据';

  const changeByOffset = (offset) => {
    if (filteredSpecies.length === 0) {
      return;
    }

    const nextIndex = clampIndex(selectedIndex + offset, filteredSpecies.length);
    setSelectedId(filteredSpecies[nextIndex].id);
  };

  const onTouchStart = (event) => {
    setTouchStartX(event.changedTouches[0].clientX);
  };

  const onTouchEnd = (event) => {
    if (touchStartX == null) {
      return;
    }

    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) < 30) {
      return;
    }

    changeByOffset(delta < 0 ? 1 : -1);
    setTouchStartX(null);
  };

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) {
      return;
    }

    const active = container.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedId, filteredSpecies]);

  return (
    <main className="space-page">
      <header className="space-header">
        <p className="badge">World Theme Explorer · iPad Mode</p>
        <h1>左右滑动动物卡片切换</h1>
        <p>保留地球视图，物种区域改成 iPad 友好的左右滑动卡片交互。</p>
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
          distributionClusters={distribution.clusters}
          rangePolygon={distribution.range}
          speciesIcon={speciesIconMap[selectedSpecies?.id] ?? '📍'}
        />
      </section>

      <section className="overlay-panel" aria-label="species cards">
        <div className="overlay-title-row">
          <h2>动物分布主题（{filteredSpecies.length} / {speciesList.length}）</h2>
          <p>{statusText}</p>
        </div>

        <div className="carousel-actions">
          <button type="button" onClick={() => changeByOffset(-1)}>
            ← 上一个
          </button>
          <p>
            {selectedIndex + 1} / {Math.max(filteredSpecies.length, 1)}
          </p>
          <button type="button" onClick={() => changeByOffset(1)}>
            下一个 →
          </button>
        </div>

        <div ref={carouselRef} className="species-carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {filteredSpecies.map((species) => {
            const active = species.id === selectedSpecies?.id;
            return (
              <div
                key={species.id}
                className={`species-carousel-item ${active ? 'active' : ''}`}
                data-active={active ? 'true' : 'false'}
                onClick={() => setSelectedId(species.id)}
              >
                <SpeciesCard species={species} />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default App;
