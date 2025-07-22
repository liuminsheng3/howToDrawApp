# Flux模型解决方案

## 为什么使用Flux模型？

1. **flux-kontext-max** - 专门设计用于基于输入图像生成新图像
2. **更好的连贯性** - 能够理解并保留输入图像的内容
3. **更高质量** - Flux模型生成的图像质量更高

## 模型配置

### 第一步（文本到图像）
使用 `black-forest-labs/flux-schnell`：
```javascript
{
  prompt: "Simple line drawing tutorial step 1: Draw a circle only",
  output_format: "png",
  aspect_ratio: "1:1",
  num_outputs: 1,
  output_quality: 80
}
```

### 后续步骤（图像到图像）
使用 `black-forest-labs/flux-kontext-max`：
```javascript
{
  prompt: "Drawing tutorial step 2: Take the existing drawing and add ears...",
  input_image: previousImageUrl,
  output_format: "png",
  guidance_scale: 3.5,
  num_outputs: 1,
  aspect_ratio: "1:1",
  output_quality: 80,
  prompt_strength: 0.8
}
```

## 关键参数说明

- **prompt_strength = 0.8** - 控制提示词的影响力（0.8表示较强的指导）
- **guidance_scale = 3.5** - 控制生成的创造性（3.5是平衡值）
- **input_image** - 前一步的图像URL，确保连贯性

## 提示词优化

1. **第一步**：明确只画基础形状
   - "Draw a circle only"
   - "Start with a simple oval shape"

2. **后续步骤**：强调在现有基础上添加
   - "Take the existing drawing and add..."
   - "Keep all previous elements visible and intact"
   - 包含具体的步骤文字说明

## 预期效果

- 每一步都真正基于前一步的图像
- 保持风格一致性
- 逐步构建完整的绘画

## 输出处理

Flux模型返回的格式可能不同：
```javascript
// 处理输出
if (output && typeof output === 'object' && 'url' in output) {
  imageUrl = typeof output.url === 'function' ? output.url() : output.url
}
```

## 故障排除

1. 如果图片仍不连贯，检查：
   - input_image是否正确传递
   - 提示词是否明确说明要保留现有内容
   - prompt_strength参数是否合适

2. 调整参数：
   - 降低prompt_strength（如0.6）以更多保留原图
   - 提高guidance_scale（如5.0）以更严格遵循提示词