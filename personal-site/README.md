# 紫微 · 个人排盘

地址：https://bullshitAI52.github.io/iztro/

纯静态个人排盘站，使用固定版本 iztro 2.6.1。浏览器本地计算公历生日、时辰与性别对应的十二宫、星曜、四化、大限区间，可导出 JSON。没有账户、数据库、分析追踪或 AI 请求；输入不自动保存。

时辰索引区分早子时（00 点）与晚子时（23 点）。本版本不进行出生地、时区或真太阳时换算，需要用户自行确认使用的时辰。

## 部署

主分支的 `personal-site/` 是网站源码。GitHub Pages 从 `gh-pages` 分支根目录发布，避免引入上游文档的 CNAME 设置。

更新后执行：

```sh
git subtree split --prefix personal-site -b site-publish
git push origin site-publish:gh-pages
git branch -D site-publish
```

本地预览：`python3 -m http.server 8080 --directory personal-site`。

后续 DeepSeek 接入应通过后端环境变量保存密钥，不要把密钥写到本站或提交到 GitHub。

排盘库来源：https://www.npmjs.com/package/iztro/v/2.6.1 。MIT 许可证位于 `vendor/IZTRO-LICENSE`。
