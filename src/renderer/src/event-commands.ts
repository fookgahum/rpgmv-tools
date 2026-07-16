import type { EventCommand, ProjectSnapshot } from '../../shared/contracts'
import type { Locale } from './i18n'

const commandNames: Record<number, [string, string]> = {
  101: ['显示文章', 'Show Text'],
  102: ['显示选项', 'Show Choices'],
  103: ['数值输入处理', 'Input Number'],
  104: ['物品选择处理', 'Select Item'],
  105: ['显示滚动文字', 'Show Scrolling Text'],
  108: ['注释', 'Comment'],
  111: ['条件分支', 'Conditional Branch'],
  112: ['循环', 'Loop'],
  113: ['中断循环', 'Break Loop'],
  115: ['中止事件处理', 'Exit Event Processing'],
  117: ['公共事件', 'Common Event'],
  118: ['标签', 'Label'],
  119: ['跳转到标签', 'Jump to Label'],
  121: ['控制开关', 'Control Switches'],
  122: ['控制变量', 'Control Variables'],
  123: ['控制独立开关', 'Control Self Switch'],
  124: ['控制计时器', 'Control Timer'],
  125: ['增减金钱', 'Change Gold'],
  126: ['增减物品', 'Change Items'],
  127: ['增减武器', 'Change Weapons'],
  128: ['增减防具', 'Change Armors'],
  129: ['更改队伍成员', 'Change Party Member'],
  132: ['更改战斗 BGM', 'Change Battle BGM'],
  133: ['更改胜利 ME', 'Change Victory ME'],
  134: ['更改禁止保存', 'Change Save Access'],
  135: ['更改禁止菜单', 'Change Menu Access'],
  136: ['更改禁止遇敌', 'Change Encounter'],
  137: ['更改禁止整队', 'Change Formation Access'],
  138: ['更改窗口颜色', 'Change Window Color'],
  139: ['更改战败 ME', 'Change Defeat ME'],
  140: ['更改交通工具 BGM', 'Change Vehicle BGM'],
  201: ['场所移动', 'Transfer Player'],
  202: ['设置交通工具位置', 'Set Vehicle Location'],
  203: ['设置事件位置', 'Set Event Location'],
  204: ['地图滚动', 'Scroll Map'],
  205: ['设置移动路线', 'Set Movement Route'],
  206: ['乘降交通工具', 'Get On/Off Vehicle'],
  211: ['更改透明状态', 'Change Transparency'],
  212: ['显示动画', 'Show Animation'],
  213: ['显示气泡图标', 'Show Balloon Icon'],
  214: ['暂时消除事件', 'Erase Event'],
  216: ['更改队伍队列行进', 'Change Player Followers'],
  217: ['集合队伍成员', 'Gather Followers'],
  221: ['淡出画面', 'Fadeout Screen'],
  222: ['淡入画面', 'Fadein Screen'],
  223: ['更改画面色调', 'Tint Screen'],
  224: ['画面闪烁', 'Flash Screen'],
  225: ['画面震动', 'Shake Screen'],
  230: ['等待', 'Wait'],
  231: ['显示图片', 'Show Picture'],
  232: ['移动图片', 'Move Picture'],
  233: ['旋转图片', 'Rotate Picture'],
  234: ['更改图片色调', 'Tint Picture'],
  235: ['消除图片', 'Erase Picture'],
  236: ['设置天气效果', 'Set Weather Effect'],
  241: ['播放 BGM', 'Play BGM'],
  242: ['淡出 BGM', 'Fadeout BGM'],
  243: ['保存 BGM', 'Save BGM'],
  244: ['恢复 BGM', 'Replay BGM'],
  245: ['播放 BGS', 'Play BGS'],
  246: ['淡出 BGS', 'Fadeout BGS'],
  249: ['播放 ME', 'Play ME'],
  250: ['播放 SE', 'Play SE'],
  251: ['停止 SE', 'Stop SE'],
  261: ['播放影片', 'Play Movie'],
  281: ['更改地图名称显示', 'Change Map Name Display'],
  282: ['更改图块组', 'Change Tileset'],
  283: ['更改战斗背景', 'Change Battle Back'],
  284: ['更改远景', 'Change Parallax'],
  285: ['获取指定位置的信息', 'Get Location Info'],
  301: ['战斗处理', 'Battle Processing'],
  302: ['商店处理', 'Shop Processing'],
  303: ['名称输入处理', 'Name Input Processing'],
  311: ['增减 HP', 'Change HP'],
  312: ['增减 MP', 'Change MP'],
  313: ['更改状态', 'Change State'],
  314: ['完全恢复', 'Recover All'],
  315: ['增减经验值', 'Change EXP'],
  316: ['增减等级', 'Change Level'],
  317: ['增减能力值', 'Change Parameter'],
  318: ['增减技能', 'Change Skill'],
  319: ['更改装备', 'Change Equipment'],
  320: ['更改名称', 'Change Name'],
  321: ['更改职业', 'Change Class'],
  322: ['更改角色图像', 'Change Actor Images'],
  323: ['更改交通工具图像', 'Change Vehicle Image'],
  324: ['更改昵称', 'Change Nickname'],
  325: ['更改简介', 'Change Profile'],
  326: ['增减 TP', 'Change TP'],
  331: ['增减敌人 HP', 'Change Enemy HP'],
  332: ['增减敌人 MP', 'Change Enemy MP'],
  333: ['更改敌人状态', 'Change Enemy State'],
  334: ['敌人完全恢复', 'Enemy Recover All'],
  335: ['敌人出现', 'Enemy Appear'],
  336: ['敌人变身', 'Enemy Transform'],
  337: ['显示战斗动画', 'Show Battle Animation'],
  339: ['强制战斗行动', 'Force Action'],
  340: ['中止战斗', 'Abort Battle'],
  351: ['打开菜单画面', 'Open Menu Screen'],
  352: ['打开保存画面', 'Open Save Screen'],
  353: ['游戏结束', 'Game Over'],
  354: ['返回标题画面', 'Return to Title Screen'],
  355: ['脚本', 'Script'],
  356: ['插件指令', 'Plugin Command'],
  401: ['文章', 'Text'],
  402: ['选择项', 'When Choice'],
  403: ['取消', 'When Cancel'],
  404: ['选项结束', 'End Choices'],
  405: ['滚动文字', 'Scrolling Text'],
  408: ['注释续行', 'Comment'],
  411: ['除此以外', 'Else'],
  412: ['分支结束', 'End Branch'],
  413: ['重复以上内容', 'Repeat Above'],
  601: ['胜利时', 'If Win'],
  602: ['逃跑时', 'If Escape'],
  603: ['失败时', 'If Lose'],
  604: ['战斗处理结束', 'End Battle Processing'],
  605: ['商店商品', 'Shop Item'],
  655: ['脚本续行', 'Script']
}

interface FormattedCommand {
  name: string
  detail: string
}

function entryName(
  project: ProjectSnapshot,
  type: 'switch' | 'variable' | 'commonEvent' | 'item' | 'weapon' | 'armor' | 'map',
  id: unknown,
  locale: Locale
): string {
  const numericId = typeof id === 'number' ? id : 0
  const entries =
    type === 'switch'
      ? project.switches
      : type === 'variable'
        ? project.variables
        : type === 'commonEvent'
          ? project.commonEvents
          : type === 'map'
            ? project.maps
            : type === 'item'
              ? project.database.items
              : type === 'weapon'
                ? project.database.weapons
                : project.database.armors
  const name = entries.find((entry) => entry.id === numericId)?.name
  const unnamed = locale === 'zh-CN' ? '未命名' : 'Unnamed'
  return `#${String(numericId).padStart(4, '0')} ${name || unnamed}`
}

function amount(
  parameters: unknown[],
  offset: number,
  project: ProjectSnapshot,
  locale: Locale
): string {
  const operation = parameters[offset] === 0 ? '+' : '-'
  const value =
    parameters[offset + 1] === 1
      ? entryName(project, 'variable', parameters[offset + 2], locale)
      : String(parameters[offset + 2] ?? 0)
  return `${operation}${value}`
}

function rawDetail(parameters: unknown[]): string {
  return parameters
    .map((value) =>
      typeof value === 'string'
        ? value
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value)
    )
    .join(', ')
}

function operand(
  project: ProjectSnapshot,
  operandType: unknown,
  value: unknown,
  locale: Locale
): string {
  return operandType === 1 ? entryName(project, 'variable', value, locale) : String(value ?? 0)
}

export function formatEventCommand(
  command: EventCommand,
  project: ProjectSnapshot,
  locale: Locale
): FormattedCommand {
  const parameters = command.parameters
  const name =
    commandNames[command.code]?.[locale === 'zh-CN' ? 0 : 1] ??
    (locale === 'zh-CN' ? `未知指令 ${command.code}` : `Unknown command ${command.code}`)
  let detail = ''

  switch (command.code) {
    case 101:
      detail = String(parameters[4] ?? '')
      break
    case 102:
      detail = Array.isArray(parameters[0]) ? parameters[0].join(' / ') : ''
      break
    case 103:
    case 104:
      detail = entryName(project, 'variable', parameters[0], locale)
      break
    case 108:
    case 118:
    case 119:
    case 355:
    case 356:
    case 401:
    case 405:
    case 408:
    case 655:
      detail = String(parameters[0] ?? '')
      break
    case 111: {
      const comparisons = ['=', '≥', '≤', '>', '<', '≠']
      if (parameters[0] === 0) {
        detail = `${entryName(project, 'switch', parameters[1], locale)} = ${parameters[2] === 0 ? 'ON' : 'OFF'}`
      } else if (parameters[0] === 1) {
        detail = `${entryName(project, 'variable', parameters[1], locale)} ${comparisons[Number(parameters[4])] ?? '?'} ${operand(project, parameters[2], parameters[3], locale)}`
      } else if (parameters[0] === 7) {
        const gold = locale === 'zh-CN' ? '金钱' : 'Gold'
        const operators = ['≥', '≤', '<']
        detail = `${gold} ${operators[Number(parameters[2])] ?? '?'} ${parameters[1] ?? 0}`
      } else if (parameters[0] === 8) {
        detail = entryName(project, 'item', parameters[1], locale)
      } else if (parameters[0] === 9) {
        detail = entryName(project, 'weapon', parameters[1], locale)
      } else if (parameters[0] === 10) {
        detail = entryName(project, 'armor', parameters[1], locale)
      } else {
        detail = rawDetail(parameters)
      }
      break
    }
    case 117:
      detail = entryName(project, 'commonEvent', parameters[0], locale)
      break
    case 121: {
      const first = entryName(project, 'switch', parameters[0], locale)
      const last =
        parameters[0] === parameters[1]
          ? ''
          : ` – ${entryName(project, 'switch', parameters[1], locale)}`
      detail = `${first}${last} = ${parameters[2] === 0 ? 'ON' : 'OFF'}`
      break
    }
    case 122: {
      const first = entryName(project, 'variable', parameters[0], locale)
      const last =
        parameters[0] === parameters[1]
          ? ''
          : ` – ${entryName(project, 'variable', parameters[1], locale)}`
      const operators = ['=', '+=', '-=', '*=', '/=', '%=']
      detail = `${first}${last} ${operators[Number(parameters[2])] ?? '?'} ${operand(project, parameters[3], parameters[4], locale)}`
      break
    }
    case 123:
      detail = `${parameters[0] ?? 'A'} = ${parameters[1] === 0 ? 'ON' : 'OFF'}`
      break
    case 125:
      detail = amount(parameters, 0, project, locale)
      break
    case 126:
    case 127:
    case 128: {
      const type = command.code === 126 ? 'item' : command.code === 127 ? 'weapon' : 'armor'
      detail = `${entryName(project, type, parameters[0], locale)} ${amount(parameters, 1, project, locale)}`
      break
    }
    case 201:
      detail =
        parameters[0] === 0
          ? `${entryName(project, 'map', parameters[1], locale)} (${parameters[2] ?? 0}, ${parameters[3] ?? 0})`
          : rawDetail(parameters)
      break
    case 230:
      detail = `${parameters[0] ?? 0} ${locale === 'zh-CN' ? '帧' : 'frames'}`
      break
    case 241:
    case 245:
    case 249:
    case 250: {
      const audio = parameters[0]
      detail =
        audio !== null && typeof audio === 'object' && 'name' in audio
          ? String(audio.name)
          : rawDetail(parameters)
      break
    }
    case 302:
    case 605: {
      const type = parameters[0] === 0 ? 'item' : parameters[0] === 1 ? 'weapon' : 'armor'
      detail = entryName(project, type, parameters[1], locale)
      break
    }
    default:
      detail = rawDetail(parameters)
  }

  return { name, detail }
}
