'use client'

import { useState, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X, Clipboard } from 'lucide-react'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  maxLength?: number
}

export function PromptInput({
  value,
  onChange,
  disabled,
  maxLength = 5000,
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
    } catch {
      // Clipboard access denied
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">
          Enter Your Prompt
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePaste}
            disabled={disabled}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <Clipboard className="mr-1 h-3 w-3" />
            Paste
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>
      <div
        className={`relative rounded-lg border transition-colors ${
          isFocused ? 'border-primary' : 'border-border'
        }`}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Paste or type the prompt you want to analyze..."
          className="min-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          maxLength={maxLength}
        />
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
          <span>
            {value.length.toLocaleString()} / {maxLength.toLocaleString()} characters
          </span>
          {value.length > 0 && (
            <span className="text-muted-foreground">
              ~{Math.ceil(value.length / 4)} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
