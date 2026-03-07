import { useMemo, useState } from 'react';
import GlobeScene from './GlobeScene';
import { countries } from './data/countries';

function App() {
  const [selectedCountryId, setSelectedCountryId] = useState(countries[0].id);

  const selectedCountry = useMemo(
    () => countries.find((country) => country.id === selectedCountryId) ?? countries[0],
    [selectedCountryId]
  );

  return (
    <main className="layout">
      <section className="hero">
        <div>
          <p className="eyebrow">Sprint 2.5</p>
          <h1>World Theme Explorer · 地图信息增强版</h1>
          <p className="lead">
            现在不再只是一个球体：已叠加国家边界轮廓和国家热点点位。点击左侧国家卡片或地球上的热点点，右侧会展示国家信息。
          </p>
        </div>
      </section>

      <section className="content-grid">
        <aside className="country-list" aria-label="country list">
          <h2>国家地图点位</h2>
          <ul>
            {countries.map((country) => (
              <li key={country.id}>
                <button
                  type="button"
                  className={country.id === selectedCountryId ? 'active' : ''}
                  onClick={() => setSelectedCountryId(country.id)}
                >
                  {country.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="viewer">
          <GlobeScene
            countries={countries}
            selectedCountryId={selectedCountryId}
            onCountrySelect={setSelectedCountryId}
          />
        </section>

        <aside className="country-panel" aria-live="polite">
          <h2>{selectedCountry.name}</h2>
          <p><strong>首都：</strong>{selectedCountry.capital}</p>
          <p><strong>人口：</strong>{selectedCountry.population}</p>
          <p><strong>特色：</strong>{selectedCountry.theme}</p>
          <p className="tip">提示：拖拽可旋转地球，滚轮可缩放，点击地球白色点位可切换国家。</p>
        </aside>
      </section>
    </main>
  );
}

export default App;
