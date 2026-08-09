import type { ReactNode } from 'react'

export function LegalDocument({ eyebrow, title, summary, lastUpdated = 'August 8, 2026', children }: { eyebrow: string; title: string; summary: string; lastUpdated?: string; children: ReactNode }) {
  return <article className="legal-page"><header><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{summary}</p><dl><div><dt>Effective</dt><dd>August 6, 2026</dd></div><div><dt>Last updated</dt><dd>{lastUpdated}</dd></div></dl><aside><strong>Pre-release draft</strong><span>WantCove and Tennessee, United States are recorded for planning, and a monitored public email is available. Legal identity, jurisdiction-specific requirements, and qualified review remain Production blockers.</span></aside></header><div className="legal-content">{children}</div></article>
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>
}
