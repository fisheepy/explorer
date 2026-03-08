# World Theme Explorer

趣味地球浏览项目，目标是在 3D 地球上按照主题（动物、植物、建筑等）探索不同地区的本地特色。

## 当前状态
- ✅ Sprint 1：完成初始化脚手架（React + Vite）
- ✅ Sprint 2：完成 Three.js 地球场景 + 基础 OrbitControls
- ✅ Sprint 2.5：补充国家边界轮廓与国家信息面板（地图信息）
- ✅ 地图数据升级：使用 OpenStreetMap 公开瓦片作为地球底图，并叠加国家高亮/热点
- ✅ 交互修复：区分点击与拖拽，避免旋转时误触发国家切换
- 🔜 Sprint 3：接入更完整国家属性数据和主题图层 demo

## 启动项目
```bash
npm install
npm run dev
```

## 当前地图展示方式
- 运行时请求 OpenStreetMap 公共瓦片并拼接为世界底图纹理
- 将拼接结果作为 `CanvasTexture` 贴到 Three.js 球体材质 `map`
- 叠加主题国家边界线与可点击热点点位，实现选中高亮与信息联动
- 若网络不可用，自动回退到简化网格纹理，保证场景可渲染

> 地图底图数据来源：© OpenStreetMap contributors

## 文档
- 初始化方案：`docs/initialization-plan.md`
