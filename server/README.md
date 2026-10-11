# 个人紫微 DeepSeek 后端

Node 22 原生 HTTP 服务，固定 iztro 2.6.1，在服务器重算盘面后调用 DeepSeek Flash。无需 npm 依赖。代码、输入、响应均不写请求日志。

- 安装目录：`/opt/ziwei-api/`（`server.cjs`、`iztro.min.js`、独立 Node 可执行文件）
- 服务：`ziwei-api.service`，以 DynamicUser 运行，只监听 `127.0.0.1:8793`
- DeepSeek 密钥：`/etc/ziwei/deepseek.env`，root 600
- 个人访问码：`/etc/ziwei/access.env`，root 600
- 对外：Nginx `2053` TLS 端口，`/ziwei-api/` 转发后端
- 配置：`/etc/nginx/conf.d/ziwei-api-tls.conf`、`/etc/nginx/ziwei-api-location.conf`
- HTTPS 使用 VPS 已有 Let's Encrypt IP 证书与已有 ACME 续期任务；`ziwei-tls-refresh.timer` 每天重载 Nginx 以读取更新后的证书
- 普通 443 端口保留原代理服务；未改动代理配置

## 验证

`node server/checks.cjs`：本地计算、日期校验、认证、跨域、畸形请求，不调用 DeepSeek。

服务健康检查 `GET /health` 不需要密钥。`POST /analyze` 需要 `Authorization: Bearer <个人访问码>`。

请求字段：`birthDate`（公历 YYYY-MM-DD）、`timeIndex`（0–12）、`gender`（男/女）、`targetDate`、`targetTimeIndex`（null或0–12）、`topic`、`question`。只接受1900至2100年有效日期，目标日期不得早于出生日期。没有目标时辰时以午时进行日级计算，不提供流时。未自动校正真太阳时。

不要把运行环境文件、访问码或 API 密钥提交到 GitHub。静态网站仅包含服务器地址。访问码可通过替换服务端环境文件并重启服务轮换；每天限额计数在内存中，重启后重置。

回退：停用 `ziwei-api.service` 和证书刷新 timer，移除专用 Nginx 配置并测试、重载；网页恢复之前提交即可。不要修改其他网站与代理配置。
