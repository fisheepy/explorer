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
- **3D 引擎**：Three.js（后续接入）
- **数据格式**：GeoJSON + 主题点位 JSON
- **状态管理**：先用 React state，复杂后再引入 Zustand

## 4. 目录规划
- `src/`
  - `app/`: 页面与应用骨架
  - `features/globe/`: 地球场景、相机与交互
  - `features/themes/`: 主题过滤与图层逻辑
  - `features/country-info/`: 国家信息卡片
  - `data/`: GeoJSON 与主题数据
  - `shared/`: 复用组件、工具函数、常量

## 5. 迭代节奏
- **Sprint 1（当前）**：完成项目初始化与路线说明。
- **Sprint 2**：实现 Three.js 地球场景 + 基础 controls。
- **Sprint 3**：接入国家数据 + 主题图层 demo。
- **Sprint 4**：探索任务与移动端优化。
