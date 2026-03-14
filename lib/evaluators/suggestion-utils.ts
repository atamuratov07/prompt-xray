import type { AppLocale } from '@/i18n/locales'

export type LocalizedText = Record<AppLocale, string>

export type LocalizedSuggestionMap<TCode extends string> = Partial<
	Record<TCode, readonly LocalizedText[]>
>

export function resolveFallbackSuggestions<TCode extends string>({
	codes,
	locale,
	suggestionsByCode,
	fallback,
}: {
	codes: readonly TCode[]
	locale: AppLocale
	suggestionsByCode: LocalizedSuggestionMap<TCode>
	fallback: LocalizedText
}): string[] {
	const suggestions: string[] = []

	for (const code of new Set(codes)) {
		const localizedSuggestions = suggestionsByCode[code] ?? []

		for (const suggestion of localizedSuggestions) {
			suggestions.push(suggestion[locale])
		}
	}

	return suggestions.length > 0 ? suggestions : [fallback[locale]]
}
