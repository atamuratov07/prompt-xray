'use client'

import { ScoreCard } from './score-card'
import { IssueCard } from './issue-card'
import { SuggestionsList } from './suggestions-list'
import { RewritePanel } from './rewrite-panel'
import type { AnalysisResult as AnalysisResultType } from '@/lib/types/common'
import { getEvaluator, getEvaluatorMeta } from '@/lib/evaluators/registry'

interface AnalysisResultProps {
	result: AnalysisResultType
}

export function AnalysisResult({ result }: AnalysisResultProps) {
	const evaluator = getEvaluator(result.evaluatorId)
	const meta = getEvaluatorMeta(result.evaluatorId)

	const isRiskScore = result.evaluatorId !== 'prompt-quality'

	return (
		<div className='space-y-8'>
			{/* Score Card */}
			<ScoreCard
				evaluatorName={meta?.name || result.evaluatorId}
				score={result.score}
				label={result.scoreLabel}
				isRiskScore={isRiskScore}
			/>

			{/* Summary */}
			<div className='space-y-2'>
				<h3 className='font-semibold text-foreground'>Summary</h3>
				<p className='text-muted-foreground leading-relaxed'>
					{result.summary}
				</p>
			</div>

			{/* Issues */}
			{result.issues.length > 0 && (
				<div className='space-y-4'>
					<h3 className='font-semibold text-foreground'>
						Findings ({result.issues.length})
					</h3>
					<div className='space-y-4'>
						{result.issues.map((issue, i) => (
							<IssueCard
								key={i}
								code={issue.code}
								severity={issue.severity}
								evidence={issue.evidence}
								explanation={evaluator?.explanations[issue.code]}
							/>
						))}
					</div>
				</div>
			)}

			{/* Suggestions */}
			<SuggestionsList suggestions={result.suggestions} />

			{/* Rewrite Panel */}
			<RewritePanel
				original={result.originalPrompt}
				rewritten={result.rewrite.text}
				rewriteType={result.rewrite.type}
			/>
		</div>
	)
}
