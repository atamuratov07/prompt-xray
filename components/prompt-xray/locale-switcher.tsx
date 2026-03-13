'use client'

import {Link, usePathname} from '@/i18n/navigation'
import {locales, type AppLocale} from '@/i18n/locales'
import {cn} from '@/lib/utils'
import {useLocale, useTranslations} from 'next-intl'

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale() as AppLocale
  const pathname = usePathname()

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
      {locales.map((nextLocale) => (
        <Link
          key={nextLocale}
          href={pathname}
          locale={nextLocale}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors',
            locale === nextLocale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {t(nextLocale)}
        </Link>
      ))}
    </div>
  )
}
