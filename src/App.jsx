import GlobeScene from './GlobeScene';

function App() {
  return (
    <main className="space-page">
      <header className="space-header">
        <p className="badge">World Theme Explorer</p>
        <h1>太空视角地球</h1>
        <p>拖拽旋转，滚轮缩放。当前版本专注“地理形态 + 视觉沉浸感”。</p>
      </header>
      <GlobeScene />
    </main>
  );
}

export default App;
