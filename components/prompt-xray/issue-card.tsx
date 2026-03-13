'use client'

import { AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Severity, ExplanationCard } from '@/lib/types/common'

interface IssueCardProps {
  code: string
  severity: Severity
  evidence: string[]
  explanation?: ExplanationCard
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

export function IssueCard({ code, severity, evidence, explanation }: IssueCardProps) {
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
              {explanation?.title || code.replace(/_/g, ' ')}
            </h4>
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                config.bg,
                config.color
              )}
            >
              {config.label}
            </span>
          </div>

          {explanation && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {explanation.description}
            </p>
          )}

          {evidence.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Evidence
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

          {explanation && (
            <>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Why it matters
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {explanation.whyItMatters}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  How to fix
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  {explanation.howToFix}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
