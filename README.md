# cpam

`cpam` 是基于 [CliRelay](https://github.com/kittors/CliRelay) 的自用二开版本，目标是作为可直接部署、可升级、可回滚的私有代理服务。

## 主要特性
- Docker Compose 一键部署
- GitHub Actions 自动构建并推送镜像
- 管理面板与远程管理
- 支持 `main` / `dev` 分支构建
- 版本号、构建时间、前端版本信息会写入构建产物

## 快速开始
### 1) 克隆仓库
```bash
git clone https://github.com/Pinevu/cpam.git
cd cpam
```

### 2) 准备配置
首次启动前，准备 `config.yaml`：
```bash
cp config.example.yaml config.yaml
```

建议重点检查：
- `port`：服务端口，默认 `8317`
- `remote-management.secret-key`：管理密钥
- `auto-update.enabled`：是否启用自动更新
- `auth-dir`：认证目录

### 3) 启动服务
```bash
docker compose up -d --build
```

### 4) 访问服务
- 服务地址：`http://服务器IP:8317`
- 管理面板：`http://服务器IP:8317/manage`
- 登录密钥：`config.yaml` 中的 `remote-management.secret-key`

## 推荐部署目录
```text
/opt/cpam/
  ├── config.yaml
  ├── auths/
  ├── logs/
  ├── data/
  └── docker-compose.yml
```

## 升级方式
### 方式 A：推荐，拉取最新代码并重建
```bash
cd /opt/cpam
git pull
docker compose up -d --build
```

### 方式 B：仅更新镜像并重启
如果你使用的是远端镜像方式，可以直接：
```bash
docker compose pull
docker compose up -d
```

## 回滚方式
### 回滚到上一版本代码
```bash
cd /opt/cpam
git log --oneline -5
git reset --hard <上一版本提交SHA>
docker compose up -d --build
```

### 回滚到旧镜像
如果你是按镜像版本部署，可指定旧 tag：
```bash
docker compose down
# 修改 docker-compose.yml 中的 image tag
docker compose up -d
```

### 回滚容器失败时的应急恢复
1. 停止当前容器
2. 恢复 `config.yaml`
3. 切回上一个可用提交或镜像
4. 重新启动

## GitHub Actions
仓库包含三类工作流：
- `docker-publish.yml`：主构建与推送
- `pr-test-build.yml`：PR 检查与测试
- `release.yaml`：tag 发布

## 构建产物信息
镜像与二进制会包含：
- `VERSION`
- `COMMIT`
- `BUILD_DATE`
- `UI_VERSION`

## 当前状态
- 仓库已整理为自用可部署版本
- Docker 构建流程已修正为推送到 `ghcr.io/Pinevu/cpam`
- PR / release / docker 构建工作流已简化并稳定化

## 注意事项
- 这是私有自用版本，不保证与上游完全兼容
- 首次部署后建议检查端口、防火墙与 `config.yaml`
- 如果你改了面板前端仓库，建议重新构建镜像以同步 UI
