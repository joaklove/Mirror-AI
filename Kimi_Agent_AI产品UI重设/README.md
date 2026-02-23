# 心镜 AI - 「云水禅心」UI 设计系统

## 概述

这是一套融合**道系、柔和、国风、高级**元素的全新 UI 设计系统，为您的「心镜 AI」产品带来沉浸式的东方美学体验。

## 设计亮点

### 🎨 配色系统
- **墨青** (#2C3E3A) - 主文字，沉稳内敛
- **远山青** (#5B7C76) - 次要文字，温润如玉
- **云母白** (#FAFAF7) - 主背景，宣纸质感
- **宣纸黄** (#F5F0E8) - 卡片背景，古朴典雅
- **朱砂** (#C45C48) - 强调色，点睛之笔

### ✨ 核心元素
1. **太极图标** - 象征阴阳平衡、道法自然
2. **水墨背景** - 远山轮廓、云雾飘动、宣纸纹理
3. **道家格言** - 融入《道德经》经典语录
4. **六维度符号** - 心、思、行、人、身、财

### 🏷️ 六维度设计
每个维度都有独特的：
- 汉字符号（心、思、行、人、身、财）
- 配色方案
- 标签体系
- 描述文案

## 文件结构

```
output/
├── design-system.md          # 完整设计系统文档
├── index.css                 # 更新后的全局样式
├── README.md                 # 本文件
├── components/
│   ├── TaijiIcon.tsx         # 太极图标组件
│   └── InkBackground.tsx     # 水墨背景组件
└── pages/
    ├── Auth.tsx              # 登录/注册页面
    ├── Index.tsx             # 首页（主界面）
    ├── Record.tsx            # 记录页面
    ├── Analysis.tsx          # 分析页面
    ├── Settings.tsx          # 设置页面
    ├── ReminderSettings.tsx  # 提醒设置页面
    ├── PrivacySettings.tsx   # 隐私设置页面
    └── NotFound.tsx          # 404页面
```

## 使用方法

### 1. 替换样式文件
将 `index.css` 复制到您的项目根目录，替换原有的样式文件。

### 2. 添加组件
将 `components/` 目录下的文件复制到您的组件目录：
- `TaijiIcon.tsx` - 太极图标
- `InkBackground.tsx` - 水墨背景

### 3. 更新页面组件
将 `pages/` 目录下的文件复制到您的页面目录，替换原有组件。

### 4. 安装依赖（如需）
```bash
# 如果需要使用中文字体
npm install @chinese-fonts/syst
npm install @chinese-fonts/lxgwwenkai
```

## 关键样式类

### 卡片
```tsx
<Card className="dao-card">
  {/* 内容 */}
</Card>
```

### 按钮
```tsx
<Button className="btn-primary">主按钮</Button>
<Button className="btn-secondary">次要按钮</Button>
<Button className="btn-ghost">幽灵按钮</Button>
```

### 输入框
```tsx
<Input className="dao-input" />
<Textarea className="dao-input" />
```

### 标签
```tsx
<Badge className="dao-tag">标签</Badge>
```

### 毛玻璃效果
```tsx
<div className="dao-glass">
  {/* 内容 */}
</div>
```

## 动画效果

- `animate-taiji` - 太极旋转
- `animate-breathe` - 呼吸效果
- `animate-fade-in-up` - 淡入上浮
- `animate-cloud-float` - 云雾飘动

## 响应式设计

- 移动端：单列布局，紧凑间距
- 平板：双列布局
- 桌面：最大宽度 720px 内容区，居中显示

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 无障碍

- 支持 `prefers-reduced-motion` 减少动画
- 文字对比度 ≥ 4.5:1
- 支持键盘导航

## 设计哲学

> 「道法自然，天人合一」

整个设计系统遵循道家哲学的核心思想：
- **无为而治** - 界面简洁，不打扰用户
- **阴阳平衡** - 色彩搭配和谐
- **天人合一** - 融入自然元素
- **返璞归真** - 去除多余装饰

## 许可证

MIT
