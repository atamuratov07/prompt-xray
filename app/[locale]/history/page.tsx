'use client'

import {LocaleSwitcher} from '@/components/prompt-xray/locale-switcher'
import {Button} from '@/components/ui/button'
import {Link} from '@/i18n/navigation'
import {
  clearHistory,
  deleteHistoryEntry,
  readHistory,
} from '@/lib/history'
import type {HistoryEntry} from '@/lib/types/common'
import {cn} from '@/lib/utils'
import {
  ArrowLeft,
  Check,
  Copy,
  GraduationCap,
  Shield,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {useTranslations} from 'next-intl'
import {useEffect, useState} from 'react'

const iconMap: Record<string, React.ElementType> = {
  privacy: Shield,
  'academic-integrity': GraduationCap,
  'prompt-quality': Sparkles,
}

export default function HistoryPage() {
  const t = useTranslations('HistoryPage')
  const evaluatorT = useTranslations('Evaluators')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    setHistory(readHistory())
  }, [])

  const handleDelete = (id: string) => {
    const updated = deleteHistoryEntry(id)
    setHistory(updated)
  }

  const handleClearAll = () => {
    setHistory([])
    clearHistory()
  }

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp))
  }

  const getScoreColor = (evaluatorId: string, score: number) => {
    const isRiskScore = evaluatorId !== 'prompt-quality'
    if (isRiskScore) {
      if (score <= 25) return 'text-score-good'
      if (score <= 50) return 'text-score-warning'
      return 'text-score-danger'
    }

    if (score >= 75) return 'text-score-good'
    if (score >= 50) return 'text-score-warning'
    return 'text-score-danger'
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t('title')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('analysesCount', {count: history.length})}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('clearAll')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-secondary p-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('emptyTitle')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('emptyDescription')}
            </p>
            <Link href="/" className="mt-4">
              <Button>{t('analyzePrompt')}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => {
              const Icon = iconMap[entry.evaluatorId] || Sparkles
              const isExpanded = expandedId === entry.id

              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : entry.id)
                    }
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-secondary/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {evaluatorT(`${entry.evaluatorId}.name`)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {entry.originalPrompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span
                          className={cn(
                            'text-lg font-bold tabular-nums',
                            getScoreColor(entry.evaluatorId, entry.score)
                          )}
                        >
                          {entry.score}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {entry.scoreLabel}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-4 border-t border-border bg-secondary/30 p-4">
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {t('originalPrompt')}
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-foreground">
                          {entry.originalPrompt}
                        </p>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {t('summary')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.summary}
                        </p>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {t('suggestedRewrite')}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopy(entry.rewrittenPrompt, entry.id)
                            }
                            className="h-7 text-xs"
                          >
                            {copiedId === entry.id ? (
                              <>
                                <Check className="mr-1 h-3 w-3 text-score-good" />
                                {t('copied')}
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" />
                                {t('copy')}
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                          <p className="whitespace-pre-wrap text-sm text-foreground">
                            {entry.rewrittenPrompt}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
