# 最终解决方案：使用img2img确保图片连贯性

## 核心原理

使用Stable Diffusion的**img2img**功能，将前一张图片作为输入基础，这样能够：
1. 保持视觉连续性
2. 在现有基础上添加新元素
3. 确保风格一致性

## 实现细节

### 1. 第一步（text2img）
```javascript
// 没有前置图片，使用常规的text2img
prompt: "Simple line drawing tutorial step 1: a circle"
```

### 2. 后续步骤（img2img）
```javascript
// 使用前一张图片作为基础
image: previousImageUrl
prompt: "Add ears to the existing drawing, keep all previous elements intact"
strength: 0.4 // 保留60%原图，修改40%
```

### 3. 关键参数说明

- **strength = 0.4**：这是关键！
  - 太低（<0.3）：改变太小，新元素不明显
  - 太高（>0.6）：改变太大，失去连贯性
  - 0.4是最佳平衡点

- **提示词策略**：
  - 第一步：描述要画什么
  - 后续步骤：强调"Add X to the existing drawing"
  - 始终包含"keep all previous elements intact"

### 4. 工作流程

```
Step 1: 生成基础圆形 → 保存图片URL
Step 2: 使用Step 1的图片 + "Add ears" → 圆形+耳朵
Step 3: 使用Step 2的图片 + "Add eyes" → 圆形+耳朵+眼睛
...以此类推
```

## 测试验证

1. 检查日志中是否显示"Using img2img with previous image"
2. 观察每一步是否基于前一步构建
3. 最终成品应该包含所有步骤的元素

## 预期效果

- 每张图片都明显基于前一张
- 新元素清晰可见
- 整体风格保持一致
- 形成完整的绘画过程

## 调试技巧

如果还是不连贯：
1. 调整strength参数（建议0.3-0.5之间）
2. 在提示词中更明确地描述要保留的元素
3. 检查previousImageUrl是否正确传递