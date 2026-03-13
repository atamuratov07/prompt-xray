import type { AnalysisResult, HistoryEntry } from '@/lib/types/common'

const STORAGE_KEY = 'prompt-xray-history'
const MAX_ITEMS = 50

function readStorage(): HistoryEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function writeStorage(history: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function readHistory(): HistoryEntry[] {
  try {
    return readStorage()
  } catch {
    return []
  }
}

export function saveToHistory(result: AnalysisResult) {
  try {
    const history = readStorage()
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      evaluatorId: result.evaluatorId,
      originalPrompt: result.originalPrompt,
      score: result.score,
      scoreLabel: result.scoreLabel,
      summary: result.summary,
      rewrittenPrompt: result.rewrite.text,
      timestamp: result.timestamp,
    }

    writeStorage([entry, ...history].slice(0, MAX_ITEMS))

    return { ok: true as const }
  } catch {
    return {
      ok: false as const,
      error: 'Analysis succeeded, but history could not be saved in this browser.',
    }
  }
}

export function deleteHistoryEntry(id: string) {
  try {
    const updated = readStorage().filter(entry => entry.id !== id)
    writeStorage(updated)
    return updated
  } catch {
    return readHistory()
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures in the history UI.
  }
}
