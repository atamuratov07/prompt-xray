import { z } from 'zod'
import type { Evaluator, QualityResponse } from './types'
import type { ExplanationCard } from '@/lib/types/common'

export const qualityIssueCodes = [
	'missing_task',
	'missing_topic',
	'missing_output_format',
	'missing_audience',
	'missing_goal',
	'missing_constraints',
	'weak_task',
	'weak_topic',
] as const

export type QualityIssueCode = (typeof qualityIssueCodes)[number]

export const qualityElementKeys = [
	'task',
	'topic',
	'output_format',
	'audience',
	'goal',
	'constraints',
] as const

export type QualityElementKey = (typeof qualityElementKeys)[number]

const qualityIssueCodeSchema = z.enum(qualityIssueCodes)
const qualityElementKeySchema = z.enum(qualityElementKeys)

const qualityResponseSchema = z.object({
  summary: z.string(),
  issues: z.array(z.object({
    code: qualityIssueCodeSchema,
    severity: z.enum(['low', 'medium', 'high']),
    evidence: z.array(z.string()),
  })),
  presentElements: z.array(qualityElementKeySchema),
  missingElements: z.array(qualityElementKeySchema),
  rewrite: z.object({
    type: z.string(),
    text: z.string(),
  }),
  suggestions: z.array(z.string()),
})

const ELEMENT_WEIGHTS: Record<QualityElementKey, number> = {
  task: 20,
  topic: 15,
  output_format: 15,
  audience: 15,
  goal: 20,
  constraints: 15,
}

function getElementKeyForIssue(code: QualityIssueCode): QualityElementKey {
  switch (code) {
    case 'missing_task':
    case 'weak_task':
      return 'task'
    case 'missing_topic':
    case 'weak_topic':
      return 'topic'
    case 'missing_output_format':
      return 'output_format'
    case 'missing_audience':
      return 'audience'
    case 'missing_goal':
      return 'goal'
    case 'missing_constraints':
      return 'constraints'
  }
}

function calculateScore(response: QualityResponse): { score: number; label: string } {
  let deductions = 0
  
  // Deduct for missing elements
  for (const missing of response.missingElements) {
    const weight = ELEMENT_WEIGHTS[missing] || 10
    deductions += weight
  }
  
  // Partial deduction for weak elements (issues with medium severity)
  for (const issue of response.issues) {
    if (issue.severity === 'medium') {
      const weight = ELEMENT_WEIGHTS[getElementKeyForIssue(issue.code)]
      deductions += weight * 0.5
    }
  }
  
  const score = Math.max(0, Math.round(100 - deductions))
  
  let label: string
  if (score >= 90) {
    label = 'Excellent'
  } else if (score >= 75) {
    label = 'Good'
  } else if (score >= 50) {
    label = 'Fair'
  } else if (score >= 25) {
    label = 'Needs Work'
  } else {
    label = 'Poor'
  }
  
  return { score, label }
}

const explanations: Record<QualityIssueCode, ExplanationCard> = {
  missing_task: {
    title: 'Task is missing or unclear',
    description: 'Your prompt does not clearly state what action you want the AI to perform.',
    whyItMatters: 'Without a clear task, the AI may guess incorrectly or provide irrelevant output.',
    howToFix: 'Start with an action verb: "Write...", "Explain...", "Create...", "Compare..."',
  },
  missing_topic: {
    title: 'Topic is missing or vague',
    description: 'Your prompt lacks a specific subject or topic.',
    whyItMatters: 'Vague topics lead to generic, unfocused responses.',
    howToFix: 'Be specific about what subject matter you want addressed.',
  },
  missing_output_format: {
    title: 'Output format is missing',
    description: 'Your prompt does not specify how the response should be structured.',
    whyItMatters: 'Without format guidance, you may get long paragraphs when you wanted bullet points, or vice versa.',
    howToFix: 'Specify format: "in bullet points", "as a table", "in 3 paragraphs", "step-by-step".',
  },
  missing_audience: {
    title: 'Target audience is missing',
    description: 'Your prompt does not indicate who the content is for.',
    whyItMatters: 'Audience determines tone, complexity, and vocabulary of the response.',
    howToFix: 'Add audience context: "for a beginner", "for a technical audience", "for a 5-year-old".',
  },
  missing_goal: {
    title: 'Goal or purpose is unclear',
    description: 'Your prompt does not explain why you need this information.',
    whyItMatters: 'Understanding the goal helps AI provide more relevant and useful responses.',
    howToFix: 'Add context about your purpose: "for a presentation", "to understand better", "for a blog post".',
  },
  missing_constraints: {
    title: 'Constraints are missing',
    description: 'Your prompt has no length, depth, or other constraints.',
    whyItMatters: 'Without constraints, responses may be too long, too short, or inappropriate for your needs.',
    howToFix: 'Add constraints: word count, number of items, time period, level of detail.',
  },
  weak_task: {
    title: 'Task could be clearer',
    description: 'Your task is present but could be more specific.',
    whyItMatters: 'Clearer tasks produce more accurate results.',
    howToFix: 'Make your action request more specific and unambiguous.',
  },
  weak_topic: {
    title: 'Topic could be more specific',
    description: 'Your topic is present but broad.',
    whyItMatters: 'Narrower topics yield more focused, useful responses.',
    howToFix: 'Narrow down your subject to a specific aspect.',
  },
}

export const promptQualityEvaluator: Evaluator<
  QualityResponse,
  'prompt-quality'
> = {
  meta: {
    id: 'prompt-quality',
    name: 'Prompt Quality Check',
    description: 'Evaluate clarity, specificity, and completeness of your prompt.',
    purpose: 'Improve your prompts to get better, more useful AI responses.',
    icon: 'Sparkles',
  },
  systemPrompt: `You are a prompt quality evaluator.

Analyze the user's prompt only for clarity, specificity, structure, completeness, and usefulness.

Do not evaluate privacy, ethics, or academic honesty.

Return a strict JSON object.

Evaluate whether the prompt clearly specifies:
- task (what action to perform)
- topic (what subject to address)
- output_format (how to structure the response)
- audience (who the content is for)
- goal (purpose of the request)
- constraints (length, depth, style preferences)

For each missing element, use issue codes: missing_task, missing_topic, missing_output_format, missing_audience, missing_goal, missing_constraints

For weak but present elements, use: weak_task, weak_topic

Also provide:
- presentElements: array of element names that are present (task, topic, output_format, audience, goal, constraints)
- missingElements: array of element names that are missing
- a short summary
- an improved rewrite that preserves the user's intent but makes the prompt more precise and useful
- concise improvement suggestions

Respond in the same language as the user's prompt when possible.`,
  responseSchema: qualityResponseSchema,
  calculateScore,
  explanations,
  getSuggestions: (response: QualityResponse) => {
    if (response.suggestions && response.suggestions.length > 0) {
      return response.suggestions
    }
    
    const suggestions: string[] = []
    
    if (response.missingElements.includes('output_format')) {
      suggestions.push('Specify the format you want (bullets, paragraphs, table, etc.).')
    }
    if (response.missingElements.includes('audience')) {
      suggestions.push('State who the answer is for.')
    }
    if (response.missingElements.includes('constraints')) {
      suggestions.push('Add constraints such as length or depth.')
    }
    if (response.missingElements.includes('goal')) {
      suggestions.push('Explain why you need this information.')
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Your prompt is well-structured!')
    }
    
    return suggestions
  },
}
