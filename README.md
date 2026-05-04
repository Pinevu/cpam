# cpam

`cpam` 是基于 [CliRelay](https://github.com/kittors/CliRelay) 的自用二开版本，目标是作为可直接部署的私有代理服务。

## 主要特性
- 支持 Docker 一键部署
- 支持 GitHub Actions 自动构建并推送镜像
- 自带管理面板与远程管理
- 支持 `main` / `dev` 分支构建
- 版本号、构建时间、前端版本信息会写入构建产物

## 部署方式
### 1. 使用 Docker Compose
```bash
git clone https://github.com/Pinevu/cpam.git
cd cpam
docker compose up -d --build
```

### 2. 访问
- 服务地址：`http://服务器IP:8317`
- 管理面板：`http://服务器IP:8317/manage`
- 登录密钥：在 `config.yaml` 的 `remote-management.secret-key`

## 配置说明
首次启动后，复制 `config.example.yaml` 为 `config.yaml` 并按需修改：
- `port`：服务端口
- `remote-management.secret-key`：管理密钥
- `auto-update`：自动更新设置
- `auth-dir`：认证目录

## GitHub Actions
仓库包含三类工作流：
- `docker-publish.yml`：主构建与推送
- `pr-test-build.yml`：PR 检查与测试
- `release.yaml`：打 tag 时发布

## 当前状态
- 仓库已完成二开初版整理
- Docker 构建流程已修正为推送到 `ghcr.io/Pinevu/cpam`
- 工作流会在构建时注入版本与构建时间

## 注意事项
- 这是私有自用版本，不保证与上游完全兼容
- 首次部署后建议检查 `config.yaml` 与端口是否已放行
