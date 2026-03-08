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
          <p className="eyebrow">地图展示 Demo</p>
          <h1>World Theme Explorer · 如何展示地图</h1>
          <p className="lead">
            现在基于公开地理数据（OpenStreetMap 瓦片）作为球体底图，并叠加国家边界与热点。
            点击国家按钮或地球热点可高亮并联动右侧国家信息。
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
          <p className="tip">提示：拖拽可旋转地球，滚轮可缩放，点击地球上的点位可切换国家（拖拽旋转不会触发误选）。</p>
          <p className="tip">地图底图 © OpenStreetMap contributors</p>
        </aside>
      </section>
    </main>
  );
}

export default App;
