import type { MetaState } from '../types/state'

const KEY = 'last_scrap_meta'

export function loadMeta(): MetaState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as MetaState
  } catch {
    return null
  }
}

export function saveMeta(meta: MetaState): void {
  localStorage.setItem(KEY, JSON.stringify(meta))
}
