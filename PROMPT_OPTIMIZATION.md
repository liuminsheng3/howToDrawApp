# 提示词优化说明

## 改进内容

### 1. OpenRouter提示词优化
- 添加了 `cumulative_prompt` 字段，包含到当前步骤为止的所有元素
- 确保每一步都基于前一步构建
- 明确的步骤结构：基础形状 → 主体结构 → 重要细节 → 最终修饰

### 2. Replicate图片生成优化
- 强调"简笔画"风格：黑色线条，白色背景
- 添加负面提示词避免复杂效果：阴影、颜色、渐变等
- 减少推理步骤到25步，生成更简洁的图片

### 3. 步骤连贯性
- 使用累积提示词确保每张图片包含之前的所有内容
- 每一步只添加少量新元素
- 保持视觉上的连续性

## 示例：画猫教程

### Step 1: 画一个大圆作为头部
- text: "Draw a large circle for the cat's head"
- cumulative_prompt: "Simple line drawing showing one large circle"

### Step 2: 添加两个三角形耳朵
- text: "Add two triangular ears on top of the circle"
- cumulative_prompt: "Simple line drawing showing a circle with two triangular ears on top"

### Step 3: 画两个点作为眼睛
- text: "Draw two dots for the eyes"
- cumulative_prompt: "Simple line drawing showing a circle with triangular ears and two dot eyes"

### Step 4: 添加倒三角形鼻子
- text: "Add a small inverted triangle for the nose"
- cumulative_prompt: "Simple line drawing showing a cat head with ears, eyes, and triangular nose"

### Step 5: 画W形嘴巴
- text: "Draw a 'W' shape under the nose for the mouth"
- cumulative_prompt: "Simple line drawing showing a cat head with ears, eyes, nose, and W-shaped mouth"

### Step 6: 添加椭圆形身体
- text: "Draw an oval shape below the head for the body"
- cumulative_prompt: "Simple line drawing showing a cat with circular head, ears, facial features, and oval body"

### Step 7: 画四条腿
- text: "Add four simple lines for legs"
- cumulative_prompt: "Simple line drawing showing a cat with head, body, and four stick legs"

### Step 8: 添加弯曲的尾巴
- text: "Draw a curved tail"
- cumulative_prompt: "Simple line drawing showing a complete cat with head, body, legs, and curved tail"

### Step 9: 添加胡须
- text: "Add three whiskers on each side of the face"
- cumulative_prompt: "Simple line drawing showing a cat with all features including whiskers"

### Step 10: 完善细节
- text: "Add paw details and refine the overall shape"
- cumulative_prompt: "Simple line drawing showing a complete cute cat with all details, clean lines"

## 预期效果
- 每张图片都能清晰地看到绘画进展
- 风格统一：简洁的黑色线条
- 适合初学者跟随
- 最终成品简单但可爱