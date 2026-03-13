# World Theme Explorer

当前版本聚焦“太空中看地球”视觉体验，并支持 iPad 紧凑卡片交互。

## 当前能力
- 沉浸式地球视图（太空风格）
- 物种卡片库（30 个明星物种）
- iPad 紧凑卡片：只展示当前有效卡片，左右显示前后淡化预览
- 左右滑动手势 + 上一张/下一张按钮
- 筛选能力：关键词、分类、风险等级
- 分布联动：GBIF 点位聚簇图标 + 范围轮廓
- 切换缓冲：切换物种时等待新分布数据就绪后再同步切换图标和点位，避免错位闪烁

## 动物媒体数据库（进行中）
- 新增 `src/data/speciesMedia.js`：为每个物种建立图标生成策略和图片数组结构
- 已接入首批真实图片样例（如熊猫、雪豹、蓝鲸、红毛猩猩）
- 卡片已支持主图显示与来源标注，无图时显示占位
- 详细计划见：`docs/animal-media-plan.md`

## 启动项目
```bash
npm install
npm run dev
```

## iPad 本地测试
项目已接入 Capacitor，可以直接生成并打开 iOS 壳工程。

```bash
npm install
npm run ios:sync
npm run ios:open
```

打开 Xcode 后按这个顺序做：
- 选中 `App` target
- `Signing & Capabilities` 里选择你的 Apple Developer Team
- 用数据线连上 iPad，确保设备已开启 `Developer Mode`
- 在 Xcode 顶部选择你的 iPad 作为运行目标
- 点击 Run，把开发中的 App 装到 iPad 上本地测试

前端代码更新后，重新执行：

```bash
npm run ios:sync
```

## 数据来源说明
- 分布点位：GBIF Occurrence API
- 风险等级：IUCN 分类体系（CR/EN/VU/NT/LC/DD/NE）
- 针对窄分布物种增加 native-range 过滤，降低离群点误导
