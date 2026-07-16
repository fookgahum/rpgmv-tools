# RPGMV Event Copilot

一个面向 RPG Maker MV 的桌面事件助手。界面支持中文与 English，可按照系统语言自动选择，也可以在应用内手动切换并记住选择。

第一版已经支持：

- 通过系统文件选择器打开并验证 `Game.rpgproject`
- 查看工程总览、地图事件和公共事件
- 浏览开关、变量、物品、武器和防具
- 将 RPGMV 事件指令转换成可读内容
- 查找开关、变量、数据库对象和公共事件的引用位置
- 中文与 English 界面切换

当前版本处于只读模式，不会修改 RPG Maker MV 工程文件。

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

RPGMV Event Copilot is a read-only desktop analyzer for RPG Maker MV projects. Version one indexes maps, events, common events, switches, variables, items, weapons, armors, event commands, and their references. The interface supports Chinese and English.
