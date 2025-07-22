# 修复进度卡在83%的问题

## 问题分析

1. **进度计算公式不一致**
   - GenerationProgress组件: `completedSteps / (totalSteps + 2) * 100`
   - 实际完成步骤: 10个图片步骤
   - 计算: 10 / (10 + 2) = 83.33%

2. **根本原因**
   - API在更新状态时，`completed_steps` 应该设置为 `completedImageSteps + 2`
   - 但是日志显示更新状态时卡住了，可能是数据库缺少列或权限问题

## 解决方案

### 1. 确保数据库有正确的列
运行 `ADD_CATEGORY_COLUMNS.sql` 和以下SQL：
```sql
-- 添加进度追踪列（如果不存在）
ALTER TABLE tutorials 
ADD COLUMN IF NOT EXISTS total_steps INTEGER,
ADD COLUMN IF NOT EXISTS completed_steps INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_step TEXT;
```

### 2. 代码修复
已经实施的修复：
- 添加了错误处理和日志
- 实现了回退逻辑（如果列不存在，只更新status）
- 添加了详细的调试日志

### 3. 进度计算逻辑
- 总任务数 = 步骤数 + 2（1个AI生成 + 1个最终处理）
- 完成的任务数 = 完成的图片步骤数 + 2（当所有图片生成完成时）

## 测试步骤
1. 确保数据库有必要的列
2. 生成一个新教程
3. 观察日志，确认状态更新成功
4. 检查进度是否达到100%