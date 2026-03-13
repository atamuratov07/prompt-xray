'use client'

import { cn } from '@/lib/utils'

interface ScoreCardProps {
  evaluatorName: string
  score: number
  label: string
  isRiskScore?: boolean // true for Privacy/Academic (higher = worse), false for Quality (higher = better)
}

export function ScoreCard({
  evaluatorName,
  score,
  label,
  isRiskScore = true,
}: ScoreCardProps) {
  const getScoreColor = () => {
    if (isRiskScore) {
      // Risk score: low is good, high is bad
      if (score <= 25) return 'text-score-good'
      if (score <= 50) return 'text-score-warning'
      return 'text-score-danger'
    } else {
      // Quality score: high is good, low is bad
      if (score >= 75) return 'text-score-good'
      if (score >= 50) return 'text-score-warning'
      return 'text-score-danger'
    }
  }

  const getBackgroundColor = () => {
    if (isRiskScore) {
      if (score <= 25) return 'bg-score-good/10 border-score-good/30'
      if (score <= 50) return 'bg-score-warning/10 border-score-warning/30'
      return 'bg-score-danger/10 border-score-danger/30'
    } else {
      if (score >= 75) return 'bg-score-good/10 border-score-good/30'
      if (score >= 50) return 'bg-score-warning/10 border-score-warning/30'
      return 'bg-score-danger/10 border-score-danger/30'
    }
  }

  const getProgressColor = () => {
    if (isRiskScore) {
      if (score <= 25) return 'bg-score-good'
      if (score <= 50) return 'bg-score-warning'
      return 'bg-score-danger'
    } else {
      if (score >= 75) return 'bg-score-good'
      if (score >= 50) return 'bg-score-warning'
      return 'bg-score-danger'
    }
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-all',
        getBackgroundColor()
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              {evaluatorName}
            </h3>
            <p className={cn('mt-1 text-2xl font-bold', getScoreColor())}>
              {label}
            </p>
          </div>
          <div className={cn('text-4xl font-bold tabular-nums', getScoreColor())}>
            {score}
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full transition-all duration-500', getProgressColor())}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {isRiskScore
            ? 'Risk score from 0-100. Lower is better.'
            : 'Quality score from 0-100. Higher is better.'}
        </p>
      </div>
    </div>
  )
}
