export const LANGUAGE_STORAGE_KEY = 'rpgmv-tools.locale'

export type Locale = 'zh-CN' | 'en'

export interface MessageSet {
  language: string
  changeProject: string
  loading: string
  readOnly: string
  search: string
  unnamed: string
  noData: string
  commands: string
  references: string
  noReferences: string
  projectPath: string
  welcome: {
    eyebrow: string
    title: string
    description: string
    select: string
    safety: string
  }
  nav: {
    overview: string
    maps: string
    commonEvents: string
    switches: string
    variables: string
    database: string
  }
  errors: {
    invalidProjectFile: string
    missingProjectData: string
    invalidJson: string
    unreadableProject: string
    unexpected: string
  }
  overview: {
    title: string
    description: string
    maps: string
    mapEvents: string
    commonEvents: string
    switches: string
    variables: string
    database: string
    eventCommands: string
    projectInfo: string
    gameTitle: string
    versionId: string
    unnamedData: string
    scanResult: string
    healthy: string
    warnings: string
    missingMap: string
    invalidMap: string
  }
  maps: {
    title: string
    map: string
    event: string
    events: string
    empty: string
    coordinates: string
    pages: string
    page: string
    conditions: string
    noConditions: string
    trigger: string
    priority: string
    movement: string
    image: string
    none: string
    note: string
    triggers: string[]
    priorities: string[]
    movements: string[]
    conditionSwitch: string
    conditionVariable: string
    conditionSelfSwitch: string
    conditionItem: string
    conditionActor: string
  }
  commonEvents: {
    title: string
    empty: string
    trigger: string
    switch: string
    triggers: string[]
  }
  data: {
    switchesTitle: string
    variablesTitle: string
    items: string
    weapons: string
    armors: string
    id: string
    name: string
    price: string
    entries: string
  }
  reference: {
    read: string
    write: string
    condition: string
    call: string
    use: string
    mapEvent: string
    commonEvent: string
    page: string
    command: string
  }
}

export const messages: Record<Locale, MessageSet> = {
  'zh-CN': {
    language: '语言',
    changeProject: '切换工程',
    loading: '正在扫描工程…',
    readOnly: '只读扫描',
    search: '按 ID 或名称搜索',
    unnamed: '未命名',
    noData: '没有可显示的数据',
    commands: '事件指令',
    references: '引用位置',
    noReferences: '当前工程中没有找到引用',
    projectPath: '工程路径',
    welcome: {
      eyebrow: 'RPG Maker MV 工程分析器',
      title: '从读取现有工程开始',
      description:
        '选择 Game.rpgproject 后，工具会读取地图事件、公共事件、开关、变量和物品数据库。第一版不会修改任何工程文件。',
      select: '选择 RPGMV 工程',
      safety: '安全模式：本版本只读取和分析工程数据。'
    },
    nav: {
      overview: '工程总览',
      maps: '地图事件',
      commonEvents: '公共事件',
      switches: '开关',
      variables: '变量',
      database: '物品与装备'
    },
    errors: {
      invalidProjectFile: '请选择名为 Game.rpgproject 的 RPG Maker MV 工程文件。',
      missingProjectData: '工程缺少 data/System.json 或 data/MapInfos.json。',
      invalidJson: '工程中存在无法解析的 JSON 文件。',
      unreadableProject: '无法读取该工程，请检查文件权限和工程完整性。',
      unexpected: '扫描工程时发生了未知错误。'
    },
    overview: {
      title: '工程总览',
      description: '当前 RPG Maker MV 工程的事件与数据库索引。',
      maps: '地图',
      mapEvents: '地图事件',
      commonEvents: '公共事件',
      switches: '开关',
      variables: '变量',
      database: '物品与装备',
      eventCommands: '事件指令',
      projectInfo: '工程信息',
      gameTitle: '游戏名称',
      versionId: '版本 ID',
      unnamedData: '未命名开关/变量',
      scanResult: '扫描结果',
      healthy: '工程核心数据读取正常',
      warnings: '发现需要注意的问题',
      missingMap: '找不到地图文件',
      invalidMap: '地图 JSON 无法解析'
    },
    maps: {
      title: '地图事件',
      map: '地图',
      event: '事件',
      events: '个事件',
      empty: '该地图中没有事件',
      coordinates: '坐标',
      pages: '事件页',
      page: '第 {id} 页',
      conditions: '出现条件',
      noConditions: '无条件',
      trigger: '触发方式',
      priority: '优先级',
      movement: '自主移动',
      image: '行走图',
      none: '无',
      note: '备注',
      triggers: ['确定键', '玩家接触', '事件接触', '自动执行', '并行处理'],
      priorities: ['通常角色下方', '与通常角色相同', '通常角色上方'],
      movements: ['固定', '随机', '接近', '自定义'],
      conditionSwitch: '开关',
      conditionVariable: '变量',
      conditionSelfSwitch: '独立开关',
      conditionItem: '持有物品',
      conditionActor: '队伍角色'
    },
    commonEvents: {
      title: '公共事件',
      empty: '工程中没有公共事件',
      trigger: '触发方式',
      switch: '触发开关',
      triggers: ['无', '自动执行', '并行处理']
    },
    data: {
      switchesTitle: '开关',
      variablesTitle: '变量',
      items: '物品',
      weapons: '武器',
      armors: '防具',
      id: 'ID',
      name: '名称',
      price: '价格',
      entries: '条数据'
    },
    reference: {
      read: '读取',
      write: '写入',
      condition: '条件',
      call: '调用',
      use: '使用',
      mapEvent: '地图事件',
      commonEvent: '公共事件',
      page: '事件页',
      command: '指令'
    }
  },
  en: {
    language: 'Language',
    changeProject: 'Change project',
    loading: 'Scanning project…',
    readOnly: 'Read-only scan',
    search: 'Search by ID or name',
    unnamed: 'Unnamed',
    noData: 'No data to display',
    commands: 'Event commands',
    references: 'References',
    noReferences: 'No references found in this project',
    projectPath: 'Project path',
    welcome: {
      eyebrow: 'RPG Maker MV project analyzer',
      title: 'Start with an existing project',
      description:
        'Select Game.rpgproject to scan map events, common events, switches, variables, items, and equipment. Version one never changes project files.',
      select: 'Select RPGMV project',
      safety: 'Safe mode: this version only reads and analyzes project data.'
    },
    nav: {
      overview: 'Overview',
      maps: 'Map events',
      commonEvents: 'Common events',
      switches: 'Switches',
      variables: 'Variables',
      database: 'Items & equipment'
    },
    errors: {
      invalidProjectFile: 'Select the Game.rpgproject file from an RPG Maker MV project.',
      missingProjectData: 'The project is missing data/System.json or data/MapInfos.json.',
      invalidJson: 'A project JSON file could not be parsed.',
      unreadableProject: 'The project could not be read. Check its permissions and integrity.',
      unexpected: 'An unexpected error occurred while scanning the project.'
    },
    overview: {
      title: 'Project overview',
      description: 'Event and database index for the current RPG Maker MV project.',
      maps: 'Maps',
      mapEvents: 'Map events',
      commonEvents: 'Common events',
      switches: 'Switches',
      variables: 'Variables',
      database: 'Items & equipment',
      eventCommands: 'Event commands',
      projectInfo: 'Project information',
      gameTitle: 'Game title',
      versionId: 'Version ID',
      unnamedData: 'Unnamed switches/variables',
      scanResult: 'Scan result',
      healthy: 'Core project data loaded successfully',
      warnings: 'Issues need attention',
      missingMap: 'Map file is missing',
      invalidMap: 'Map JSON could not be parsed'
    },
    maps: {
      title: 'Map events',
      map: 'Map',
      event: 'Event',
      events: 'events',
      empty: 'This map has no events',
      coordinates: 'Coordinates',
      pages: 'Event pages',
      page: 'Page {id}',
      conditions: 'Conditions',
      noConditions: 'No conditions',
      trigger: 'Trigger',
      priority: 'Priority',
      movement: 'Autonomous movement',
      image: 'Character image',
      none: 'None',
      note: 'Note',
      triggers: ['Action button', 'Player touch', 'Event touch', 'Autorun', 'Parallel'],
      priorities: ['Below characters', 'Same as characters', 'Above characters'],
      movements: ['Fixed', 'Random', 'Approach', 'Custom'],
      conditionSwitch: 'Switch',
      conditionVariable: 'Variable',
      conditionSelfSwitch: 'Self switch',
      conditionItem: 'Has item',
      conditionActor: 'Actor in party'
    },
    commonEvents: {
      title: 'Common events',
      empty: 'This project has no common events',
      trigger: 'Trigger',
      switch: 'Trigger switch',
      triggers: ['None', 'Autorun', 'Parallel']
    },
    data: {
      switchesTitle: 'Switches',
      variablesTitle: 'Variables',
      items: 'Items',
      weapons: 'Weapons',
      armors: 'Armors',
      id: 'ID',
      name: 'Name',
      price: 'Price',
      entries: 'entries'
    },
    reference: {
      read: 'Read',
      write: 'Write',
      condition: 'Condition',
      call: 'Call',
      use: 'Use',
      mapEvent: 'Map event',
      commonEvent: 'Common event',
      page: 'Page',
      command: 'Command'
    }
  }
}

function isSupportedLocale(value: string | null): value is Locale {
  return value === 'zh-CN' || value === 'en'
}

export function resolveSystemLocale(systemLanguage: string): Locale {
  return systemLanguage.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en'
}

export function getInitialLocale(storedLocale: string | null, systemLanguage: string): Locale {
  return isSupportedLocale(storedLocale) ? storedLocale : resolveSystemLocale(systemLanguage)
}
