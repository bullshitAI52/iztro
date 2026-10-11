# 紫微 · 个人排盘与日期解读

网站：https://bullshitai52.github.io/iztro/

使用固定版本 iztro 2.6.1 在浏览器生成本命十二宫、星曜、四化和大限区间；支持指定年份流年叠盘及连续五年对照，可导出当前盘面 JSON。DeepSeek 接口部署在个人 VPS，用于按具体日期分析婚姻关系、财务安排、工作及具体事情。

## 使用

1. 填写公历生日、出生时辰、性别，生成命盘。
2. 查看「今年」「明年」或指定年份的流年。
3. 在「这一天，这件事」选择日期、可选时辰和主题，写下背景，填写私下交付的个人访问码后解读。

排盘在本地完成。只有主动点击解读，出生信息、目标日期和问题才发送到 VPS 与 DeepSeek。DeepSeek 密钥始终保存在服务器，个人访问码仅保存在当前标签页 sessionStorage，可主动清除。没有账户、数据库或分析追踪；AI 回答不自动存档。

## 计算口径

使用公历输入；区分早子时（00点）和晚子时（23点），不自动校正时区或真太阳时。流年以农历正月初一分界。年度视图取目标公历年7月1日作参考（出生当年生日更晚时取生日），显示参考日；具体日期解读则按实际选择的日期计算。没有选择目标时辰时只提供日期层级，不推断流时。

年份范围为出生年份至2100年；五年对照在2100年截止。超出本盘大限覆盖范围时明确提示。AI 内容可能有误，命理无法可靠预测真实事件，不应据此决定投资、婚姻或其他重大事项。

## 后端与访问保护

API：`https://107.172.32.153:2053/ziwei-api/analyze`。服务器重新计算本命、大限、流年、流月、流日；仅指定目标时辰时提供流时。采用 Bearer 个人访问码，限制允许的网页来源，每分钟6次、每天60次（UTC日期，重启重置）、最多2个并发请求。密钥、访问码不要提交到 GitHub。

服务源码和运行说明位于主分支 `server/README.md`。静态网站不包含任何密钥。

## 部署与验证

主分支 `personal-site/` 为网页源码，GitHub Pages 从 `gh-pages` 分支根目录发布，避免引用上游文档的 CNAME。每次脚本或样式更新需同步变更 index.html 的资源版本参数。

```sh
git subtree split --prefix personal-site -b site-publish-update
git push origin site-publish-update:gh-pages
git branch -D site-publish-update
node personal-site/checks/forecast.cjs
node server/checks.cjs
```

本地预览：`python3 -m http.server 8080 --directory personal-site`；线上 API 仅允许已配置的来源，不允许 localhost 调用。

排盘库来自 https://www.npmjs.com/package/iztro/v/2.6.1 ，MIT 许可证位于 `vendor/IZTRO-LICENSE`。
