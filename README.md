# World Theme Explorer

趣味地球浏览项目，目标是在 3D 地球上按照主题（动物、植物、建筑等）探索不同地区的本地特色。

## 当前状态
- ✅ Sprint 1：完成初始化脚手架（React + Vite）
- ✅ Sprint 2：完成 Three.js 地球场景 + 基础 OrbitControls
- ✅ Sprint 2.5：补充国家边界轮廓与国家信息面板（地图信息）
- 🔜 Sprint 3：接入真实国家 GeoJSON 和主题图层 demo

## 启动项目
```bash
npm install
npm run dev
```

## 已实现能力
- 3D 地球球体与基础光照
- OrbitControls 旋转与缩放
- 国家边界线（示例国家）
- 国家热点点位点击与信息面板联动
- 渲染循环和 resize 自适应
- 场景资源清理（组件卸载时）

## 文档
- 初始化方案：`docs/initialization-plan.md`
