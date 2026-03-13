export const locales = ['en', 'ru', 'uz-Latn'] as const

export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'en'
