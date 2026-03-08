# World Theme Explorer

当前版本聚焦“太空中看地球”视觉体验，并完成动物主题 MVP Step 2：分布点位/范围联动 + 筛选 + GBIF/IUCN。

## 当前能力
- 沉浸式地球视图（太空风格）
- 物种卡片库（30 个明星物种）
- 筛选能力：关键词、分类、风险等级
- 分布联动：选中物种后在地球上叠加分布点位 + 范围轮廓
- 数据源：GBIF 实时点位（失败时 fallback），IUCN 风险色卡

## 启动项目
```bash
npm install
npm run dev
```

## 数据来源说明
- 分布点位：GBIF Occurrence API
- 风险等级：IUCN 分类体系（CR/EN/VU/NT/LC/DD/NE）
- 当前 IUCN 详细描述为本地结构化字段，后续可接入官方 API/数据包

## 下一步
- 接入 IUCN 分布范围 GeoJSON（多边形而非 bbox）
- 增加时间维度过滤（历史/近期观测）
- 增加国家/区域联动统计
