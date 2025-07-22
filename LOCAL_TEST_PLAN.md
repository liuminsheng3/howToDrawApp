# 本地测试计划

## 测试环境
- URL: http://localhost:3001
- 需要在 .env.local 中配置实际的API密钥

## 测试步骤

### 1. 首页测试
- [ ] 访问 http://localhost:3001
- [ ] 检查分类导航是否正确显示（动物、自然、物品、人物）
- [ ] 点击"Generate New Tutorial"按钮

### 2. 生成页面测试
- [ ] 输入主题（如："cat"）
- [ ] 点击生成按钮
- [ ] 观察进度显示：
  - [ ] "Generating tutorial structure with AI"
  - [ ] "Generating image for step 1-10"
  - [ ] "Finalizing tutorial"
  - [ ] 进度百分比是否正确更新
  - [ ] 最终是否达到100%

### 3. 分类系统测试
- [ ] 生成完成后，检查是否显示预览图片
- [ ] 点击"View Tutorial"链接
- [ ] 检查URL是否为 /animal/cats/[id]
- [ ] 检查教程详情页是否正确显示

### 4. 分类浏览测试
- [ ] 访问 /animal 查看动物分类
- [ ] 访问 /animal/cats 查看猫的教程列表
- [ ] 检查教程卡片是否正确显示

### 5. 错误处理测试
- [ ] 不输入主题直接点击生成
- [ ] 输入特殊字符作为主题
- [ ] 检查错误提示是否友好

## 需要监控的日志
1. 浏览器控制台
2. 服务器终端输出
3. 特别关注：
   - [Generate API] 相关日志
   - [Generate Images API] 相关日志
   - 数据库错误信息

## 已知问题
1. 需要配置实际的API密钥
2. 数据库可能缺少必要的列（需要运行COMPLETE_DB_SETUP.sql）
3. NSFW误报可能导致某些图片生成失败