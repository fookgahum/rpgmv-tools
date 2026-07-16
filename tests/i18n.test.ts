import { describe, expect, it } from 'vitest'
import { getInitialLocale, resolveSystemLocale } from '../src/renderer/src/i18n'

describe('language selection', () => {
  it('uses Chinese for Chinese system locales', () => {
    expect(resolveSystemLocale('zh-CN')).toBe('zh-CN')
    expect(resolveSystemLocale('zh-TW')).toBe('zh-CN')
  })

  it('uses English for other system locales', () => {
    expect(resolveSystemLocale('en-US')).toBe('en')
    expect(resolveSystemLocale('ja-JP')).toBe('en')
  })

  it('prefers a saved supported language', () => {
    expect(getInitialLocale('en', 'zh-CN')).toBe('en')
    expect(getInitialLocale('zh-CN', 'en-US')).toBe('zh-CN')
  })

  it('ignores unsupported saved values', () => {
    expect(getInitialLocale('fr', 'zh-CN')).toBe('zh-CN')
  })
})
