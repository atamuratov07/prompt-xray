'use client'

import { Shield, GraduationCap, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EvaluatorMeta } from '@/lib/types/common'
import type { EvaluatorId } from '@/lib/evaluators/ids'
import { useTranslations } from 'next-intl'

const iconMap: Record<string, React.ElementType> = {
	Shield,
	GraduationCap,
	Sparkles,
}

interface EvaluatorPickerProps {
	evaluators: EvaluatorMeta[]
	selected: EvaluatorId
	onSelect: (id: EvaluatorId) => void
	disabled?: boolean
}

export function EvaluatorPicker({
	evaluators,
	selected,
	onSelect,
	disabled,
}: EvaluatorPickerProps) {
	const t = useTranslations('EvaluatorPicker')
	const evaluatorT = useTranslations('Evaluators')
	return (
		<div className='flex flex-col gap-3'>
			<label className='text-sm font-medium text-muted-foreground'>
				{t('label')}
			</label>
			<div className='grid gap-3 sm:grid-cols-3'>
				{evaluators.map(evaluator => {
					const Icon = iconMap[evaluator.icon] || Sparkles
					const isSelected = selected === evaluator.id

					return (
						<button
							key={evaluator.id}
							onClick={() => onSelect(evaluator.id)}
							disabled={disabled}
							className={cn(
								'group relative flex flex-col gap-2 rounded-lg border p-4 text-left transition-all',
								'hover:border-primary/50 hover:bg-secondary/50',
								'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
								'disabled:opacity-50 disabled:cursor-not-allowed',
								isSelected
									? 'border-primary bg-primary/10'
									: 'border-border bg-card',
							)}
						>
							<div className='flex items-center gap-3'>
								<div
									className={cn(
										'flex h-10 w-10 items-center justify-center rounded-md',
										isSelected
											? 'bg-primary text-primary-foreground'
											: 'bg-secondary text-muted-foreground group-hover:text-foreground',
									)}
								>
									<Icon className='h-5 w-5' />
								</div>
								<span className='font-semibold text-foreground'>
									{evaluatorT(`${evaluator.id}.name`)}
								</span>
							</div>
							<p className='text-sm text-muted-foreground leading-relaxed'>
								{evaluatorT(`${evaluator.id}.description`)}
							</p>
							{isSelected && (
								<div className='absolute -right-px -top-px h-3 w-3 rounded-bl-md rounded-tr-lg bg-primary' />
							)}
						</button>
					)
				})}
			</div>
		</div>
	)
}
