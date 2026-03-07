const milestones = [
  {
    title: 'Milestone 1 · Foundation',
    points: [
      '搭建 React + Vite + Three.js 技术骨架',
      '完成可旋转/缩放的 3D 地球基础场景',
      '准备国家边界与基础国家信息数据结构',
    ],
  },
  {
    title: 'Milestone 2 · Theme Layer',
    points: [
      '实现主题切换：动物 / 植物 / 建筑',
      '根据主题渲染热点点位与标签',
      '点击国家弹出信息卡片（国名、首都、人口）',
    ],
  },
  {
    title: 'Milestone 3 · Exploration Loop',
    points: [
      '加入自动飞行到目标区域的相机引导',
      '增加“探索任务”玩法和完成反馈',
      '补充移动端手势优化与性能策略',
    ],
  },
];

function App() {
  return (
    <main className="page">
      <header>
        <p className="eyebrow">Project Kickoff</p>
        <h1>World Theme Explorer 初始化方案</h1>
        <p className="lead">
          目标是构建一个可视化 3D 地球探索产品：用户通过缩放、旋转和主题切换，发现不同地区的动物、植物与建筑特色。
        </p>
      </header>

      <section>
        <h2>MVP 范围（首个版本）</h2>
        <ul>
          <li>3D 地球基础交互：旋转、缩放、拖拽。</li>
          <li>国家级信息展示：点击国家后显示基础资料。</li>
          <li>主题图层切换：动物 / 植物 / 建筑的示例点位。</li>
        </ul>
      </section>

      <section>
        <h2>阶段计划</h2>
        <div className="cards">
          {milestones.map((milestone) => (
            <article key={milestone.title} className="card">
              <h3>{milestone.title}</h3>
              <ul>
                {milestone.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>下一步建议</h2>
        <p>
          下一次 PR 将实现 Three.js 场景初始化、地球球体与相机控制器（OrbitControls），并接入第一份国家 GeoJSON 数据源。
        </p>
      </section>
    </main>
  );
}

export default App;
