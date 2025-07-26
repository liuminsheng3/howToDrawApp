# 绘画教程生成应用 - 项目上下文

## 项目概述
一个使用 AI 生成分步绘画教程的 Next.js 应用，使用 GPT-4 生成教程内容，Stable Diffusion 生成示例图片。

## 技术栈
- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **后端**: Next.js API Routes (Node.js runtime)
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: 
  - OpenRouter (GPT-4) - 教程文本生成
  - Replicate (Stable Diffusion) - 图片生成
- **部署**: Vercel

## 核心功能
1. **教程生成**: 用户输入主题，AI生成10步绘画教程
2. **图片生成**: 每一步都配有AI生成的示例图片
3. **分类系统**: 教程按类别组织（动物、自然、物品、人物等）
4. **进度追踪**: 实时显示生成进度
5. **图片存储**: 将Replicate的临时图片保存到Supabase存储

## 重要文件结构
```
/app
  /api
    /generate/route.ts        # 主生成API，创建教程结构
    /generate-images/route.ts # 图片生成API，处理步骤图片
  /[category]
    /[subcategory]
      /[id]/page.tsx         # 教程详情页
      /page.tsx              # 子分类列表页
    /page.tsx                # 分类列表页
  /generate/page.tsx         # 生成页面
  /page.tsx                  # 首页，显示分类导航
  
/lib
  /openrouter.ts            # GPT-4 API 封装
  /replicate.ts             # Stable Diffusion API 封装
  /supabase.ts              # Supabase 客户端
  /imageStorage.ts          # 图片下载和存储逻辑
  /categorize.ts            # 主题分类逻辑

/components
  /TutorialCard.tsx         # 教程卡片组件
  /StepViewer.tsx           # 步骤查看器组件
  /GenerationProgress.tsx   # 生成进度组件
```

## 数据库结构
### tutorials 表
- id (uuid)
- topic (text) - 用户输入的主题
- title (text) - 教程标题
- intro (text) - 教程介绍
- outro (text) - 教程总结
- status (text) - 状态: generating/ready/error
- created_at (timestamp)
- total_steps (int) - 总步骤数
- completed_steps (int) - 已完成步骤数
- current_step (text) - 当前步骤
- category (text) - 主分类
- subcategory (text) - 子分类

### tutorial_steps 表
- id (uuid)
- tutorial_id (uuid) - 关联教程
- step_number (int) - 步骤编号
- title (text) - 步骤标题
- instructions (text) - 步骤说明
- image_prompt (text) - 图片生成提示
- image_url (text) - Replicate原始URL
- stored_image_url (text) - Supabase存储URL
- created_at (timestamp)

## 关键问题和解决方案

### 1. Vercel部署超时问题
**问题**: Edge Runtime在构建时尝试预渲染API路由导致超时
**解决**: 
- 使用 `export const runtime = 'nodejs'`
- 添加 `export const dynamic = 'force-dynamic'`
- 设置 `export const maxDuration = 60`

### 2. 后台任务处理
**问题**: Serverless函数在返回响应后立即终止
**解决**: 
- 将图片生成分离到独立的API端点
- 主API返回后触发图片生成API
- 前端轮询获取进度更新

### 3. NSFW误报问题
**问题**: Replicate经常将正常的绘画教程标记为NSFW
**解决**:
- 添加安全前缀："Safe for work, educational drawing tutorial:"
- 实现重试逻辑（最多3次）
- 使用不同的提示词变体

### 4. 进度计算错误
**问题**: 完成时显示83%而不是100%
**解决**: 
- 总任务数 = 步骤数 + 2（AI生成 + 最终处理）
- 公式: `(completedSteps / (totalSteps + 2)) * 100`

### 5. 图片链接过期
**问题**: Replicate的图片URL会在一段时间后失效
**解决**:
- 下载图片到本地
- 上传到Supabase Storage
- 保存永久URL到数据库

### 6. 进度卡在83%问题
**问题**: 所有步骤完成后，进度显示83%而不是100%
**原因**: 
- 日志显示在"updating status"步骤卡住
- 可能是数据库缺少进度追踪列或权限问题
**解决**:
- 添加错误处理和回退逻辑
- 如果进度列不存在，只更新status字段
- 添加详细日志以便调试

### 7. 图片连贯性问题（已解决）
**问题**: 每一步生成的图片之间没有联系，不像是逐步绘画
**原因**:
- 每个步骤独立生成，没有包含之前的内容
- 提示词没有累积构建
- img2img方法效果不理想
**解决**:
- 创建一致性生成策略 `lib/consistentGeneration.ts`
- 先生成完整成品作为参考，确保风格统一
- 为每个步骤使用精确的提示词和统一的风格指南
- 第一步只有基础形状，最后一步使用完整成品
- 中间步骤累积添加元素，但独立生成

## 环境变量
```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
OPENROUTER_API_KEY=xxx
REPLICATE_API_TOKEN=xxx
```

## 分类系统
- **动物** (animal): 猫(cats)、狗(dogs)、鸟(birds)、鱼(fish)
- **自然** (nature): 树木(trees)、花朵(flowers)、风景(landscapes)
- **物品** (object): 车辆(vehicles)、建筑(buildings)、食物(food)
- **人物** (people): 肖像(portraits)、角色(characters)
- **其他** (other): 杂项(misc)

## 待运行的SQL脚本
需要在Supabase中运行以下SQL：
1. `RUN_THIS_SQL.sql` - 添加进度追踪列
2. `ADD_CATEGORY_COLUMNS.sql` - 添加分类列

## 常见命令
```bash
# 本地开发
npm run dev

# 构建
npm run build

# 提交代码
git add -A && git commit -m "message" && git push origin main
```

## 注意事项
1. 生成教程时会自动根据主题分类
2. 图片生成是异步的，可能需要等待几分钟
3. 每个教程通常有10个步骤
4. 生成页面只负责显示进度，完成后跳转到分类页面查看