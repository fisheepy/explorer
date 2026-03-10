# World Theme Explorer 初始化方案

## 1. 产品目标
- 构建“太空视角地球”作为核心视觉体验。
- 在地球上叠加主题探索层，先从动物分布与物种知识卡片切入。

## 2. 当前实现（MVP Step 2.3）
- 全屏 3D 地球场景（Three.js + OrbitControls）
- 明星物种卡片库（30 个）
- 卡片字段：中英文名、拉丁名、分类、简介、IUCN 风险色卡
- iPad 紧凑交互：当前主卡 + 前后淡化预览
- 筛选器：关键词 / 分类 / 风险等级
- 分布联动：GBIF 实时点位 + 自动范围轮廓 + 图标聚簇
- 数据清洗：native-range 过滤离群点

## 3. 当前架构
- `src/GlobeScene.jsx`：地球渲染与分布层叠加（图标聚簇 + 范围）
- `src/data/species.js`：物种数据、IUCN 风险映射、图标映射、native-range
- `src/services/gbif.js`：GBIF 查询、范围推导、fallback 点位生成、聚簇算法
- `src/App.jsx`：筛选、紧凑卡片切换、数据加载状态、卡片与地球联动

## 4. MVP 路线（动物主题）
1. ✅ Step 1：建立 30 个明星物种卡片数据库。
2. ✅ Step 2：分布点位/范围联动 + 筛选 + GBIF/IUCN 接入。
3. ✅ Step 2.1：图标化分布与邻近点聚簇显示。
4. ✅ Step 2.2：iPad 左右滑动卡片切换。
5. ✅ Step 2.3：当前主卡 + 前后淡化预览（更 compact）。
6. 🔜 Step 3：接入 IUCN 范围多边形和更丰富字段。
