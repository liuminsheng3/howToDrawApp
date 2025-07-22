# 图片连贯性解决方案

## 问题分析
之前的图片之间没有联系，因为：
1. 每个步骤独立生成图片，没有包含之前的内容
2. OpenRouter可能没有生成cumulative_prompt字段
3. 即使有，也可能不够智能

## 解决方案

### 1. 智能提示词构建器 (promptBuilder.ts)
创建了一个智能的提示词构建系统：
- **自动提取绘画元素**：从每一步的文本中智能提取要画的内容
- **累积构建**：确保每一步都包含之前所有的元素
- **主题优化**：根据不同主题（动物、建筑等）优化提示词

### 2. 工作原理示例

假设画猫的教程：

**Step 1**: "Draw a large circle for the head"
- 提取元素：["a circle"]
- 生成提示：`Simple line drawing tutorial step 1: a circle. Clean minimalist style...`

**Step 2**: "Add two triangular ears on top"
- 提取元素：["a circle", "ears"]
- 生成提示：`Simple line drawing tutorial step 2: cat with a circle and ears. Clean minimalist style... Emphasize the newly added triangular ears`

**Step 3**: "Draw two dots for eyes"
- 提取元素：["a circle", "ears", "eyes"]
- 生成提示：`Simple line drawing tutorial step 3: cat with a circle, ears, and eyes. Clean minimalist style... Emphasize the newly added dots for eyes`

### 3. 关键改进

1. **智能解析**：
   - 识别基础形状（circle, oval, square）
   - 提取添加的元素（ears, eyes, nose）
   - 处理复数形式（ear→ears, eye→eyes）

2. **连贯性保证**：
   - 每一步都明确说明包含哪些元素
   - 强调新添加的部分
   - 保持风格一致性

3. **主题优化**：
   - 动物类：添加"cute style, friendly appearance"
   - 建筑类：添加"geometric style, clear structure"
   - 自然类：添加"organic shapes, natural flow"

## 测试方法

1. 生成新教程时，观察控制台日志
2. 查看每一步的cumulative prompt
3. 确认图片是否逐步构建

## 预期效果

- 第1张图：只有基础形状
- 第2张图：基础形状 + 第一个细节
- 第3张图：包含前两步的所有内容 + 新细节
- ...以此类推
- 最后一张图：完整的绘画成品

## 调试技巧

如果图片仍然不连贯：
1. 检查日志中的cumulative prompt
2. 确认提取的元素是否正确
3. 可以手动调整promptBuilder.ts中的提取逻辑