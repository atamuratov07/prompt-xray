'use client'

import { Spinner } from '@/components/ui/spinner'
import { useTranslations } from 'next-intl'

interface LoadingStateProps {
  evaluatorName: string
}

export function LoadingState({ evaluatorName }: LoadingStateProps) {
  const t = useTranslations('LoadingState')
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="text-center">
        <p className="font-medium text-foreground">{t('title')}</p>
        <p className="text-sm text-muted-foreground">
          {t('running', {evaluator: evaluatorName})}
        </p>
      </div>
    </div>
  )
}
