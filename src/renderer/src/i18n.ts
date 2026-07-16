export const LANGUAGE_STORAGE_KEY = 'rpgmv-tools.locale'

export type Locale = 'zh-CN' | 'en'

interface MessageSet {
  language: string
  eyebrow: string
  title: string
  description: string
  readyTitle: string
  readyDescription: string
}

export const messages: Record<Locale, MessageSet> = {
  'zh-CN': {
    language: '语言',
    eyebrow: 'RPG Maker MV 事件助手',
    title: '用自然语言创建 RPGMV 事件',
    description: '开发环境已经准备完成。接下来将从安全读取 RPG Maker MV 工程开始。',
    readyTitle: '基础环境已就绪',
    readyDescription: 'Electron、React、TypeScript 与构建工具均已连接。'
  },
  en: {
    language: 'Language',
    eyebrow: 'RPG Maker MV event assistant',
    title: 'Create RPGMV events with natural language',
    description:
      'The development environment is ready. Next, we will safely open and read an RPG Maker MV project.',
    readyTitle: 'Foundation ready',
    readyDescription: 'Electron, React, TypeScript, and the build toolchain are connected.'
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
