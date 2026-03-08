import { useEffect, useMemo, useState } from 'react';
import GlobeScene from './GlobeScene';
import { riskLegend, speciesFocusMap, speciesList } from './data/species';
import { buildFallbackPoints, buildRangePolygon, fetchGbifOccurrences } from './services/gbif';

function SpeciesCard({ species, active, onSelect }) {
  const risk = riskLegend[species.riskLevel] ?? riskLegend.DD;

  return (
    <article className={`species-card ${active ? 'active' : ''}`} onClick={() => onSelect(species.id)}>
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

function App() {
  const [selectedId, setSelectedId] = useState(speciesList[0].id);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [distribution, setDistribution] = useState({ points: [], range: null, source: 'loading', gbifTaxonKey: null });

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

  useEffect(() => {
    if (!filteredSpecies.some((species) => species.id === selectedId) && filteredSpecies.length > 0) {
      setSelectedId(filteredSpecies[0].id);
    }
  }, [filteredSpecies, selectedId]);

  const selectedSpecies =
    filteredSpecies.find((species) => species.id === selectedId) ?? filteredSpecies[0] ?? speciesList[0];

  useEffect(() => {
    if (!selectedSpecies) {
      setDistribution({ points: [], range: null, source: 'empty', gbifTaxonKey: null });
      return;
    }

    const controller = new AbortController();
    setDistribution((current) => ({ ...current, source: 'loading' }));

    fetchGbifOccurrences(selectedSpecies.latinName, controller.signal)
      .then((payload) => {
        const points = payload.points.slice(0, 260);
        if (points.length < 20) {
          throw new Error('GBIF points not enough');
        }
        setDistribution({
          points,
          range: buildRangePolygon(points),
          source: 'gbif',
          gbifTaxonKey: payload.gbifTaxonKey,
        });
      })
      .catch(() => {
        const fallback = buildFallbackPoints(speciesFocusMap[selectedSpecies.id]);
        setDistribution({
          points: fallback,
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
        ? `来源：GBIF（点位 ${distribution.points.length}）${distribution.gbifTaxonKey ? ` · taxonKey ${distribution.gbifTaxonKey}` : ''}`
        : distribution.source === 'fallback'
          ? `来源：本地 fallback（点位 ${distribution.points.length}）`
          : '暂无分布数据';

  return (
    <main className="space-page">
      <header className="space-header">
        <p className="badge">World Theme Explorer · MVP Step 2</p>
        <h1>分布点位/范围联动 + 筛选 + GBIF/IUCN</h1>
        <p>筛选物种后，地球会联动展示分布点位（GBIF）和范围轮廓；风险等级采用 IUCN 色卡。</p>
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
        <GlobeScene distributionPoints={distribution.points} rangePolygon={distribution.range} />
      </section>

      <section className="overlay-panel" aria-label="species cards">
        <div className="overlay-title-row">
          <h2>动物分布主题（{filteredSpecies.length} / {speciesList.length}）</h2>
          <p>{statusText}</p>
        </div>

        <div className="species-grid">
          {filteredSpecies.map((species) => (
            <SpeciesCard
              key={species.id}
              species={species}
              active={selectedSpecies?.id === species.id}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
