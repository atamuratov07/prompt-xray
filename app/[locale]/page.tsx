'use client'

import {AnalysisResult} from '@/components/prompt-xray/analysis-result'
import {EvaluatorPicker} from '@/components/prompt-xray/evaluator-picker'
import {LoadingState} from '@/components/prompt-xray/loading-state'
import {LocaleSwitcher} from '@/components/prompt-xray/locale-switcher'
import {PromptInput} from '@/components/prompt-xray/prompt-input'
import {Button} from '@/components/ui/button'
import {Link} from '@/i18n/navigation'
import {evaluatorList} from '@/lib/evaluators/registry'
import type {EvaluatorId} from '@/lib/evaluators/ids'
import {saveToHistory} from '@/lib/history'
import type {AnalysisResult as AnalysisResultType} from '@/lib/types/common'
import {ArrowLeft, History, Scan} from 'lucide-react'
import {useLocale, useTranslations} from 'next-intl'
import {useState} from 'react'
import {toast} from 'sonner'

export default function HomePage() {
  const t = useTranslations('HomePage')
  const evaluatorT = useTranslations('Evaluators')
  const locale = useLocale()
  const [selectedEvaluator, setSelectedEvaluator] =
    useState<EvaluatorId>('privacy')
  const [prompt, setPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResultType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const evaluatorName = evaluatorT(`${selectedEvaluator}.name`)

  const handleAnalyze = async () => {
    if (!prompt.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          evaluatorId: selectedEvaluator,
          prompt: prompt.trim(),
          locale,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('analysisFailed'))
      }

      const data: AnalysisResultType = await response.json()
      setResult(data)

      const historyResult = saveToHistory(data)
      if (!historyResult.ok) {
        toast.error(t('historySaveFailed'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scan className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t('appName')}
              </h1>
              <p className="text-xs text-muted-foreground">
                {t('appSubtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link href="/history">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                {t('history')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {result ? (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('newAnalysis')}
            </Button>
            <AnalysisResult result={result} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground text-balance">
                {t('title')}
              </h2>
              <p className="mt-2 text-muted-foreground text-pretty">
                {t('subtitle')}
              </p>
            </div>

            <EvaluatorPicker
              evaluators={evaluatorList}
              selected={selectedEvaluator}
              onSelect={setSelectedEvaluator}
              disabled={isAnalyzing}
            />

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={isAnalyzing}
            />

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {isAnalyzing && <LoadingState evaluatorName={evaluatorName} />}

            {!isAnalyzing && (
              <Button
                onClick={handleAnalyze}
                disabled={!prompt.trim()}
                className="w-full gap-2"
                size="lg"
              >
                <Scan className="h-5 w-5" />
                {t('analyzeWith', {evaluator: evaluatorName})}
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
