'use client'

import { Lightbulb, CheckCircle2 } from 'lucide-react'

interface SuggestionsListProps {
  suggestions: string[]
}

export function SuggestionsList({ suggestions }: SuggestionsListProps) {
  if (!suggestions.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Suggestions</h3>
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-foreground">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
