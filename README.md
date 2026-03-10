# World Theme Explorer

当前版本聚焦“太空中看地球”视觉体验，并支持 iPad 交互：动物卡片改为左右滑动切换。

## 当前能力
- 沉浸式地球视图（太空风格）
- 物种卡片库（30 个明星物种）
- iPad 卡片交互：左右滑动切换 + 上一张/下一张按钮
- 筛选能力：关键词、分类、风险等级
- 分布联动：GBIF 点位聚簇图标 + 范围轮廓

## 启动项目
```bash
npm install
npm run dev
```

## 数据来源说明
- 分布点位：GBIF Occurrence API
- 风险等级：IUCN 分类体系（CR/EN/VU/NT/LC/DD/NE）
- 针对窄分布物种增加 native-range 过滤，降低离群点误导
