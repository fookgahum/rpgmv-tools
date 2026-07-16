import type { RpgmvApi } from '../../shared/contracts'

declare global {
  interface Window {
    rpgmv: RpgmvApi
  }
}

export {}
