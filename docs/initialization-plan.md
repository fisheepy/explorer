# World Theme Explorer 初始化方案

## 1. 产品目标
- 用 3D 地球承载多主题地理内容浏览体验。
- 在全球 -> 国家 -> 地区的缩放路径中，展示结构化主题知识。
- 支持可扩展主题（动物、植物、建筑等）与探索玩法。

## 2. MVP 定义
1. 地球基础场景（旋转、缩放、拖拽）。
2. 国家信息弹层（国名、首都、人口、国旗）。
3. 主题图层切换（动物/植物/建筑）和示例热点。

## 3. 技术选型
- **前端框架**：React + Vite
- **3D 引擎**：Three.js
- **数据格式**：GeoJSON + 主题点位 JSON
- **状态管理**：先用 React state，复杂后再引入 Zustand

## 4. 目录规划（当前实现）
- `src/App.jsx`: Sprint 2 页面编排和状态说明
- `src/GlobeScene.jsx`: Three.js 场景与 controls
- `src/main.jsx`: React 入口
- `src/styles.css`: 页面与地球容器样式

## 5. 迭代节奏
- ✅ **Sprint 1**：完成项目初始化与路线说明。
- ✅ **Sprint 2**：实现 Three.js 地球场景 + 基础 controls。
- 🔜 **Sprint 3**：接入国家数据 + 主题图层 demo。
- 🔜 **Sprint 4**：探索任务与移动端优化。
