'use client'

import { AnalysisResult } from '@/components/prompt-xray/analysis-result'
import { EvaluatorPicker } from '@/components/prompt-xray/evaluator-picker'
import { LoadingState } from '@/components/prompt-xray/loading-state'
import { PromptInput } from '@/components/prompt-xray/prompt-input'
import { Button } from '@/components/ui/button'
import { evaluatorList, getEvaluatorMeta } from '@/lib/evaluators/registry'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import { saveToHistory } from '@/lib/history'
import type { AnalysisResult as AnalysisResultType } from '@/lib/types/common'
import { ArrowLeft, History, Scan } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function HomePage() {
	const [selectedEvaluator, setSelectedEvaluator] =
		useState<EvaluatorId>('privacy')
	const [prompt, setPrompt] = useState('')
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [result, setResult] = useState<AnalysisResultType | null>(null)
	const [error, setError] = useState<string | null>(null)

	const handleAnalyze = async () => {
		if (!prompt.trim()) return

		setIsAnalyzing(true)
		setError(null)
		setResult(null)

		try {
			const response = await fetch('/api/analyze', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					evaluatorId: selectedEvaluator,
					prompt: prompt.trim(),
				}),
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.error || 'Analysis failed')
			}

			const data: AnalysisResultType = await response.json()
			setResult(data)

			const historyResult = saveToHistory(data)
			if (!historyResult.ok) {
				toast.error(historyResult.error)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Something went wrong')
		} finally {
			setIsAnalyzing(false)
		}
	}

	const handleReset = () => {
		setResult(null)
		setError(null)
	}

	const currentEvaluatorMeta = getEvaluatorMeta(selectedEvaluator)

	return (
		<main className='min-h-screen bg-background'>
			{/* Header */}
			<header className='border-b border-border'>
				<div className='mx-auto flex max-w-4xl items-center justify-between px-4 py-4'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
							<Scan className='h-5 w-5 text-primary-foreground' />
						</div>
						<div>
							<h1 className='text-xl font-bold text-foreground'>
								Prompt X-Ray
							</h1>
							<p className='text-xs text-muted-foreground'>
								Multi-mode prompt evaluation
							</p>
						</div>
					</div>
					<Link href='/history'>
						<Button variant='ghost' size='sm' className='gap-2'>
							<History className='h-4 w-4' />
							History
						</Button>
					</Link>
				</div>
			</header>

			<div className='mx-auto max-w-4xl px-4 py-8'>
				{result ? (
					/* Results View */
					<div className='space-y-6'>
						<Button
							variant='ghost'
							onClick={handleReset}
							className='gap-2 text-muted-foreground hover:text-foreground'
						>
							<ArrowLeft className='h-4 w-4' />
							New Analysis
						</Button>
						<AnalysisResult result={result} />
					</div>
				) : (
					/* Input View */
					<div className='space-y-8'>
						{/* Intro */}
						<div className='text-center'>
							<h2 className='text-2xl font-bold text-foreground text-balance'>
								Analyze your prompts before you send them
							</h2>
							<p className='mt-2 text-muted-foreground text-pretty'>
								Choose an analysis mode to evaluate your prompt for
								privacy, academic integrity, or quality issues.
							</p>
						</div>

						{/* Evaluator Selection */}
						<EvaluatorPicker
							evaluators={evaluatorList}
							selected={selectedEvaluator}
							onSelect={setSelectedEvaluator}
							disabled={isAnalyzing}
						/>

						{/* Prompt Input */}
						<PromptInput
							value={prompt}
							onChange={setPrompt}
							disabled={isAnalyzing}
						/>

						{/* Error State */}
						{error && (
							<div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4'>
								<p className='text-sm text-destructive'>{error}</p>
							</div>
						)}

						{/* Loading State */}
						{isAnalyzing && (
							<LoadingState
								evaluatorName={
									currentEvaluatorMeta?.name || 'Evaluator'
								}
							/>
						)}

						{/* Analyze Button */}
						{!isAnalyzing && (
							<Button
								onClick={handleAnalyze}
								disabled={!prompt.trim()}
								className='w-full gap-2'
								size='lg'
							>
								<Scan className='h-5 w-5' />
								Analyze with{' '}
								{currentEvaluatorMeta?.name || 'Selected Evaluator'}
							</Button>
						)}
					</div>
				)}
			</div>
		</main>
	)
}
