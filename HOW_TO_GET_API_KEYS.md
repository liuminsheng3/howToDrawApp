# 如何获取API密钥

## 1. Supabase密钥

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 "Settings" -> "API"
4. 你会看到：
   - **Project URL**: 这是 `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: 这是 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: 这是 `SUPABASE_SERVICE_ROLE_KEY`（可选）

## 2. OpenRouter API密钥

1. 访问 [OpenRouter](https://openrouter.ai)
2. 注册/登录账号
3. 进入 Dashboard -> API Keys
4. 创建新的API密钥
5. 这是你的 `OPENROUTER_API_KEY`

## 3. Replicate API Token

1. 访问 [Replicate](https://replicate.com)
2. 注册/登录账号
3. 点击右上角头像 -> "API tokens"
4. 创建新的token
5. 这是你的 `REPLICATE_API_TOKEN`

## 配置步骤

1. 打开 `.env.local` 文件（不是 `.env.local.example`）
2. 替换所有 `your_xxx_here` 为实际的值
3. 保存文件
4. 重启开发服务器：
   ```bash
   # 先停止服务器 (Ctrl+C)
   # 然后重新启动
   npm run dev
   ```

## 示例（不要使用真实密钥）

```env
NEXT_PUBLIC_SUPABASE_URL=https://obdnfxohhlsxcqrzhsad.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENROUTER_API_KEY=sk-or-v1-abc123...
REPLICATE_API_TOKEN=r8_abc123...
```