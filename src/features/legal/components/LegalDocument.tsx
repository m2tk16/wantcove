import type { ReactNode } from 'react'

export function LegalDocument({ eyebrow, title, summary, children }: { eyebrow: string; title: string; summary: string; children: ReactNode }) {
  return <article className="legal-page"><header><span className="kicker">{eyebrow}</span><h1>{title}</h1><p>{summary}</p><dl><div><dt>Effective</dt><dd>August 6, 2026</dd></div><div><dt>Last updated</dt><dd>August 6, 2026</dd></div></dl><aside><strong>Pre-release draft</strong><span>Operator identity, jurisdiction, and a monitored contact method must be added and reviewed before Beta enables accounts or commercial links.</span></aside></header><div className="legal-content">{children}</div></article>
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>
}
