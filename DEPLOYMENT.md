# 前端部署指南

## Vercel 部署（推荐）

1. 访问 https://vercel.com 并登录
2. 点击 "New Project"
3. 导入 GitHub 仓库 `famliy-payment-tracker-web`
4. 在 Environment Variables 中添加：
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```
5. 点击 "Deploy"

## Netlify 部署

1. 访问 https://www.netlify.com 并登录
2. 点击 "Add new site" → "Import an existing project"
3. 连接 GitHub 仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 在 Environment Variables 中添加：
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app
   ```
6. 点击 "Deploy site"

## 重要提示

⚠️ 部署前请确保：
- 后端已经成功部署并运行
- `VITE_API_BASE_URL` 环境变量设置为正确的后端 URL
- 后端 CORS 配置允许前端域名访问

部署后，您可以在任何设备上通过前端 URL 访问应用！
