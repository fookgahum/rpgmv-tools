# RPGMV Event Copilot

一个面向 RPG Maker MV 的桌面事件助手。界面支持中文与 English，可按照系统语言自动选择，也可以在应用内手动切换并记住选择。

当前版本已经支持：

- 通过系统文件选择器打开并验证 `Game.rpgproject`
- 查看工程总览、地图事件和公共事件
- 按需加载并渲染 RPGMV 图块地图、自动图块、阴影和远景
- 在地图上缩放、拖动、定位事件和选择事件坐标
- 浏览开关、变量、物品、武器和防具
- 将 RPGMV 事件指令转换成可读内容
- 查找开关、变量、数据库对象和公共事件的引用位置
- 重命名开关与变量
- 新建和修改公共事件、地图事件及事件页
- 通过地图选点新建或移动事件，不需要手工猜测坐标
- 添加常用的对话、流程、金钱、物品和传送指令
- 写入前差异预览、外部改动检测、自动备份和单步撤销
- 中文与 English 界面切换

工程文件只会在用户确认差异后写入。每次写入前都会在工程的 `.rpgmv-copilot/backups` 目录创建备份。

## 开发

```powershell
npm.cmd install
npm.cmd run dev
```

## 检查

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Windows 打包

```powershell
npm.cmd run build:unpack
npm.cmd run build:win
```

## English

RPGMV Event Copilot is a safe desktop editor for RPG Maker MV projects. It lazily renders RPGMV tile maps, supports coordinate-based event creation and movement, and provides controlled event editing with diff previews, external-change detection, automatic backups, atomic writes, and one-step undo. The interface supports Chinese and English.
