'use client'

import { useState } from 'react'
import { Check, Copy, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface RewritePanelProps {
  original: string
  rewritten: string
  rewriteType: string
}

export function RewritePanel({ original, rewritten, rewriteType }: RewritePanelProps) {
  const t = useTranslations('RewritePanel')
  const [copied, setCopied] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rewritten)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const typeLabels: Record<string, string> = {
    sanitized: t('types.sanitized'),
    learning_oriented: t('types.learning_oriented'),
    improved_prompt: t('types.improved_prompt'),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">
            {typeLabels[rewriteType] || t('types.fallback')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
          className="text-xs"
        >
          {showComparison ? t('hideComparison') : t('showComparison')}
        </Button>
      </div>

      {showComparison ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('original')}
            </p>
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {original}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-primary uppercase tracking-wider">
              {t('improved')}
            </p>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {rewritten}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 pr-12">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {rewritten}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={cn(
              'absolute right-2 top-2 h-8 w-8',
              copied && 'text-score-good'
            )}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ArrowRight className="h-4 w-4" />
        <span>{t('hint')}</span>
      </div>
    </div>
  )
}
