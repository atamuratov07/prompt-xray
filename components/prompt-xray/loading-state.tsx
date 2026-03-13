'use client'

import { Spinner } from '@/components/ui/spinner'

interface LoadingStateProps {
  evaluatorName: string
}

export function LoadingState({ evaluatorName }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="text-center">
        <p className="font-medium text-foreground">Analyzing your prompt...</p>
        <p className="text-sm text-muted-foreground">
          Running {evaluatorName}
        </p>
      </div>
    </div>
  )
}
