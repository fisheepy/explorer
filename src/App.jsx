import GlobeScene from './GlobeScene';
import { riskLegend, speciesList } from './data/species';

function SpeciesCard({ species }) {
  const risk = riskLegend[species.riskLevel] ?? riskLegend.DD;

  return (
    <article className="species-card">
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
  return (
    <main className="space-page">
      <header className="space-header">
        <p className="badge">World Theme Explorer · MVP</p>
        <h1>太空视角地球 + 明星物种卡片</h1>
        <p>首批收录 {speciesList.length} 个代表性物种，展示中英文名、学名、分类、简介与濒危风险色卡。</p>
      </header>

      <section className="globe-wrap">
        <GlobeScene />
      </section>

      <section className="overlay-panel" aria-label="species cards">
        <div className="overlay-title-row">
          <h2>动物分布主题（物种卡片库）</h2>
          <p>IUCN 风险分级用于视觉提醒：CR / EN / VU / NT / LC</p>
        </div>

        <div className="species-grid">
          {speciesList.map((species) => (
            <SpeciesCard key={species.id} species={species} />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
