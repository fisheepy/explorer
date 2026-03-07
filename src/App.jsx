import GlobeScene from './GlobeScene';

const sprint2Checklist = [
  'Three.js 场景初始化完成',
  '地球球体 + 氛围层渲染完成',
  'OrbitControls（旋转/缩放）接入',
  '窗口 resize 自适应与资源释放',
];

function App() {
  return (
    <main className="layout">
      <section className="hero">
        <div>
          <p className="eyebrow">Sprint 2</p>
          <h1>World Theme Explorer · 3D 地球基础场景</h1>
          <p className="lead">
            当前版本已完成 Three.js 地球场景与基础 controls，用户可以旋转与缩放地球。
            下一步将接入国家 GeoJSON 与主题图层数据。
          </p>
        </div>
        <ul className="checklist">
          {sprint2Checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="viewer">
        <GlobeScene />
      </section>
    </main>
  );
}

export default App;
