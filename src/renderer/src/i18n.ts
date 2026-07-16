export const LANGUAGE_STORAGE_KEY = 'rpgmv-tools.locale'

export type Locale = 'zh-CN' | 'en'

export interface MessageSet {
  language: string
  changeProject: string
  loading: string
  safeWrite: string
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
    noProject: string
    invalidChange: string
    projectChanged: string
    writeFailed: string
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
    newEvent: string
    editEvent: string
    addPage: string
  }
  commonEvents: {
    title: string
    empty: string
    trigger: string
    switch: string
    triggers: string[]
    newEvent: string
    editEvent: string
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
  editor: {
    cancel: string
    preview: string
    undo: string
    applying: string
    name: string
    note: string
    x: string
    y: string
    previewTitle: string
    previewDescription: string
    before: string
    after: string
    confirmWrite: string
    changeApplied: string
    changeUndone: string
    backup: string
    commandType: string
    insertAt: string
    indent: string
    addCommand: string
    delete: string
    endPosition: string
    beforeCommand: string
    content: string
    target: string
    state: string
    on: string
    off: string
    operation: string
    set: string
    add: string
    subtract: string
    amount: string
    value: string
    frames: string
    destinationX: string
    destinationY: string
    comparison: string
    equal: string
    greaterEqual: string
    lessEqual: string
    greater: string
    less: string
    notEqual: string
    switchOne: string
    switchTwo: string
    minimum: string
    selfSwitch: string
    actorId: string
    types: {
      text: string
      switch: string
      variable: string
      selfSwitch: string
      gold: string
      item: string
      weapon: string
      armor: string
      commonEvent: string
      wait: string
      transfer: string
      conditionSwitch: string
      conditionVariable: string
      conditionItem: string
    }
  }
}

export const messages: Record<Locale, MessageSet> = {
  'zh-CN': {
    language: '语言',
    changeProject: '切换工程',
    loading: '正在扫描工程…',
    safeWrite: '预览后写入',
    search: '按 ID 或名称搜索',
    unnamed: '未命名',
    noData: '没有可显示的数据',
    commands: '事件指令',
    references: '引用位置',
    noReferences: '当前工程中没有找到引用',
    projectPath: '工程路径',
    welcome: {
      eyebrow: 'RPG Maker MV 事件助手',
      title: '打开并安全编辑现有工程',
      description:
        '选择 Game.rpgproject 后，可以浏览和编辑地图事件、公共事件、开关与变量。所有修改必须先查看差异，确认后才会写入。',
      select: '选择 RPGMV 工程',
      safety: '安全写入：外部改动检测、自动备份、原子替换和单步撤销。'
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
      missingProjectData: '工程缺少必要的 RPG Maker MV 数据文件。',
      invalidJson: '工程中存在无法解析的 JSON 文件。',
      unreadableProject: '无法读取该工程，请检查文件权限和工程完整性。',
      unexpected: '处理工程时发生了未知错误。',
      noProject: '当前没有打开的工程。',
      invalidChange: '修改内容无效，请检查输入的数据。',
      projectChanged: '预览后工程文件发生了变化，已阻止写入。请重新扫描后再修改。',
      writeFailed: '写入失败，原工程文件没有被替换。'
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
      conditionActor: '队伍角色',
      newEvent: '新建事件',
      editEvent: '编辑事件页',
      addPage: '新增事件页'
    },
    commonEvents: {
      title: '公共事件',
      empty: '工程中没有公共事件',
      trigger: '触发方式',
      switch: '触发开关',
      triggers: ['无', '自动执行', '并行处理'],
      newEvent: '新建公共事件',
      editEvent: '编辑公共事件'
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
    },
    editor: {
      cancel: '取消',
      preview: '预览修改',
      undo: '撤销上次写入',
      applying: '正在写入…',
      name: '名称',
      note: '备注',
      x: 'X 坐标',
      y: 'Y 坐标',
      previewTitle: '确认工程修改',
      previewDescription: '写入前请检查目标文件及前后差异。确认后会自动创建备份。',
      before: '修改前',
      after: '修改后',
      confirmWrite: '确认并写入',
      changeApplied: '修改已写入工程。',
      changeUndone: '上一次写入已经撤销。',
      backup: '备份位置',
      commandType: '指令类型',
      insertAt: '插入位置',
      indent: '缩进层级',
      addCommand: '添加指令',
      delete: '删除',
      endPosition: '列表末尾',
      beforeCommand: '指令 {id} 之前',
      content: '内容',
      target: '目标',
      state: '状态',
      on: '开启',
      off: '关闭',
      operation: '操作',
      set: '赋值',
      add: '增加',
      subtract: '减少',
      amount: '数量',
      value: '数值',
      frames: '帧数',
      destinationX: '目标 X',
      destinationY: '目标 Y',
      comparison: '比较方式',
      equal: '等于',
      greaterEqual: '大于等于',
      lessEqual: '小于等于',
      greater: '大于',
      less: '小于',
      notEqual: '不等于',
      switchOne: '条件开关 1',
      switchTwo: '条件开关 2',
      minimum: '最小值',
      selfSwitch: '独立开关',
      actorId: '角色 ID',
      types: {
        text: '显示文章',
        switch: '控制开关',
        variable: '控制变量',
        selfSwitch: '控制独立开关',
        gold: '增减金钱',
        item: '增减物品',
        weapon: '增减武器',
        armor: '增减防具',
        commonEvent: '调用公共事件',
        wait: '等待',
        transfer: '场所移动',
        conditionSwitch: '开关条件分支',
        conditionVariable: '变量条件分支',
        conditionItem: '物品条件分支'
      }
    }
  },
  en: {
    language: 'Language',
    changeProject: 'Change project',
    loading: 'Scanning project…',
    safeWrite: 'Preview before write',
    search: 'Search by ID or name',
    unnamed: 'Unnamed',
    noData: 'No data to display',
    commands: 'Event commands',
    references: 'References',
    noReferences: 'No references found in this project',
    projectPath: 'Project path',
    welcome: {
      eyebrow: 'RPG Maker MV event assistant',
      title: 'Open and safely edit a project',
      description:
        'Select Game.rpgproject to browse and edit map events, common events, switches, and variables. Every change requires a diff preview before it can be written.',
      select: 'Select RPGMV project',
      safety:
        'Safe writes: external-change detection, backups, atomic replacement, and one-step undo.'
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
      missingProjectData: 'The project is missing required RPG Maker MV data files.',
      invalidJson: 'A project JSON file could not be parsed.',
      unreadableProject: 'The project could not be read. Check its permissions and integrity.',
      unexpected: 'An unexpected error occurred while processing the project.',
      noProject: 'No project is currently open.',
      invalidChange: 'The change is invalid. Check the entered data.',
      projectChanged:
        'The project changed after preview, so the write was blocked. Rescan and try again.',
      writeFailed: 'The write failed and the original project file was not replaced.'
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
      conditionActor: 'Actor in party',
      newEvent: 'New event',
      editEvent: 'Edit event page',
      addPage: 'Add event page'
    },
    commonEvents: {
      title: 'Common events',
      empty: 'This project has no common events',
      trigger: 'Trigger',
      switch: 'Trigger switch',
      triggers: ['None', 'Autorun', 'Parallel'],
      newEvent: 'New common event',
      editEvent: 'Edit common event'
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
    },
    editor: {
      cancel: 'Cancel',
      preview: 'Preview change',
      undo: 'Undo last write',
      applying: 'Writing…',
      name: 'Name',
      note: 'Note',
      x: 'X coordinate',
      y: 'Y coordinate',
      previewTitle: 'Confirm project change',
      previewDescription: 'Review the target file and diff. A backup is created before writing.',
      before: 'Before',
      after: 'After',
      confirmWrite: 'Confirm and write',
      changeApplied: 'The change was written to the project.',
      changeUndone: 'The last write was undone.',
      backup: 'Backup',
      commandType: 'Command type',
      insertAt: 'Insert position',
      indent: 'Indent level',
      addCommand: 'Add command',
      delete: 'Delete',
      endPosition: 'End of list',
      beforeCommand: 'Before command {id}',
      content: 'Content',
      target: 'Target',
      state: 'State',
      on: 'ON',
      off: 'OFF',
      operation: 'Operation',
      set: 'Set',
      add: 'Add',
      subtract: 'Subtract',
      amount: 'Amount',
      value: 'Value',
      frames: 'Frames',
      destinationX: 'Destination X',
      destinationY: 'Destination Y',
      comparison: 'Comparison',
      equal: 'Equals',
      greaterEqual: 'At least',
      lessEqual: 'At most',
      greater: 'Greater than',
      less: 'Less than',
      notEqual: 'Not equal',
      switchOne: 'Condition switch 1',
      switchTwo: 'Condition switch 2',
      minimum: 'Minimum',
      selfSwitch: 'Self switch',
      actorId: 'Actor ID',
      types: {
        text: 'Show text',
        switch: 'Control switch',
        variable: 'Control variable',
        selfSwitch: 'Control self switch',
        gold: 'Change gold',
        item: 'Change items',
        weapon: 'Change weapons',
        armor: 'Change armors',
        commonEvent: 'Call common event',
        wait: 'Wait',
        transfer: 'Transfer player',
        conditionSwitch: 'Switch condition',
        conditionVariable: 'Variable condition',
        conditionItem: 'Item condition'
      }
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
