# 动物媒体数据库化开发计划（MVP）

## 背景
当前物种库已具备文字与分布能力，但图标与真实图片仍是弱结构化状态。为了支持 iPad 端高质量展示，需要把媒体资源（图标/图片）数据库化。

## 目标
- 每个动物具备可扩展媒体结构：图标策略 + 多图图库 + 来源与版权信息。
- 首批支持在卡片内显示真实图片（有则展示、无则占位）。
- 为后续接入 LLM 图标生成和开源图库抓取预留字段。

## 分阶段路线
### Step 1（本次）
1. 新增媒体数据表 `speciesMediaMap`：
   - `icon`: 生成策略、风格、prompt（用于后续 LLM 生成）
   - `images[]`: 图片 URL、来源、作者、license、attribution、是否主图
2. 卡片 UI 接入：优先显示主图；无图显示占位。
3. 为首批若干物种填充真实图片样例，其余保留空数组。

### Step 2
1. 建立媒体抓取脚本（Wikimedia / iNaturalist / GBIF media）。
2. 自动去重与质量过滤（尺寸、比例、清晰度、版权）。
3. 每物种至少 3 张可用图片。

### Step 3
1. 图标生成管线：调用 LLM 图像 API 批量生成统一风格图标。
2. 人工审核与版本管理（v1/v2）。
3. 按主题切换图标风格（卡通 / 写实）。

### Step 4
1. 在详情页提供多图轮播与来源标注。
2. 增加图片缓存与离线包策略（iPad 体验优化）。
3. 建立更新任务（按月增量更新媒体库）。

## 数据结构草案
```ts
speciesMediaMap[speciesId] = {
  icon: {
    strategy: 'llm-generated',
    style: 'cartoon' | 'realistic',
    prompt: string,
    assetUrl?: string,
    version?: string,
  },
  images: Array<{
    url: string,
    source: 'wikimedia' | 'inaturalist' | 'gbif' | 'other',
    author?: string,
    license?: string,
    attribution?: string,
    isPrimary?: boolean,
  }>
}
```
