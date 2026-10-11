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

## 流年与未来五年

生成本命盘后，点击「今年」「明年」或输入年份。提供流年十二宫叠盘、流年星曜、四化落宫、所处大限／童限，以及从所选年份起连续五年对照。导出包含当前选中年份的数据。仅展示传统排盘数据，尚不提供 AI 文字解读。

采用 iztro 默认运限正月初一分界，以目标公历年 7 月 1 日午时为参考点；出生当年生日晚于参考点时改用生日。页面明确显示参考日。支持出生公历年份至 2100 年；2097 年之后的对照表在 2100 年截止。超出本盘大限覆盖范围时明确提示，不假造大限。

计算验证：`node personal-site/checks/forecast.cjs`。
