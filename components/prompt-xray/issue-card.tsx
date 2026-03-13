'use client'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Severity } from '@/lib/types/common'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import { useTranslations } from 'next-intl'

interface IssueCardProps {
  evaluatorId: EvaluatorId
  code: string
  severity: Severity
  evidence: string[]
}

const severityConfig = {
  low: {
    icon: Info,
    color: 'text-score-good',
    bg: 'bg-score-good/10',
    border: 'border-score-good/30',
    label: 'Low',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-score-warning',
    bg: 'bg-score-warning/10',
    border: 'border-score-warning/30',
    label: 'Medium',
  },
  high: {
    icon: AlertTriangle,
    color: 'text-score-danger',
    bg: 'bg-score-danger/10',
    border: 'border-score-danger/30',
    label: 'High',
  },
}

export function IssueCard({
  evaluatorId,
  code,
  severity,
  evidence,
}: IssueCardProps) {
  const t = useTranslations('IssueCard')
  const issueT = useTranslations(`IssueExplanations.${evaluatorId}.${code}`)
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        config.bg,
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', config.color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-foreground">
              {issueT('title')}
            </h4>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                config.bg,
                config.color
              )}
            >
              {t(`severity.${severity}`)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {issueT('description')}
          </p>

          {evidence.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('evidence')}
              </p>
              <div className="flex flex-wrap gap-2">
                {evidence.map((item, i) => (
                  <code
                    key={i}
                    className="rounded bg-secondary px-2 py-1 text-xs font-mono text-foreground"
                  >
                    {item}
                  </code>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('whyItMatters')}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {issueT('whyItMatters')}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('howToFix')}
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {issueT('howToFix')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
