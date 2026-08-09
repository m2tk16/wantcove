# WantCove legal and policy change control

This file is a release guardrail, not legal advice. Qualified counsel must review the final policies for the operator’s identity, jurisdiction, audience, affiliate programs, and actual data practices before Production.

## Required public routes

- `/contact`, `/terms`, and `/privacy` must remain available from the footer on every public page.
- They are footer-only legal links and do not belong in primary product navigation.
- Each policy displays an effective date and last-updated date.

## Terms review triggers

Update the Terms in the same release whenever a major change affects affiliate or retailer links, product claims or pricing, accounts, user content, eligibility, payments, subscriptions, third-party services, intellectual property, prohibited conduct, warranties, liability, governing law, disputes, or termination.

## Privacy review triggers

Update the Privacy Policy before materially changing personal data collection, authentication, saved content, analytics, cookies, advertising, personalization, affiliate click tracking, vendors/subprocessors, purposes, sharing, retention, deletion, security, children’s access, international transfers, or user privacy rights.

Current product-media rule: public catalog images are served through WantCove's first-party `/products/` path on AWS hosting, and administrator mutations reject arbitrary external image hosts. The Privacy Policy must be reviewed in the same release if that boundary or its hosting vendors change.

## Affiliate disclosure rules

- Before any compensated product link is activated, place a plain-language disclosure close enough that a user can see the relationship and the link together.
- Do not rely only on Terms, Privacy, an About page, a tooltip, or the phrase “affiliate link.”
- Explain that the user leaves WantCove, the destination retailer controls the transaction and its privacy practices, and WantCove may earn a commission if the user purchases through the link.
- Add `rel="sponsored noopener noreferrer"` to compensated external links and open a new tab only when the user experience calls for it.
- Never imply that a retailer sponsors or endorses WantCove without written authorization.
- If WantCove joins Amazon Associates, add the exact current Amazon-required site identification statement and link-level disclosures before using Amazon Special Links. Do not display that program statement before enrollment is active.

## Amazon Associates enrollment record

Owner-provided notice received 2026-08-07:

- Marketplace: Amazon.com Associates Program.
- Public Associate/tracking ID: `wantcove-20`. This identifier is intended to appear in Special Links and is not an authentication secret.
- Status: access to Associates Central is active; Amazon says the application will be reviewed after qualified referred sales. Do not describe the application as finally approved until Associates Central confirms it.
- Qualification window: the notice says access may be withdrawn if affiliate links do not refer qualified sales within 180 days. The exact enrollment/start date must be confirmed in Associates Central before setting an operational deadline.
- Repository privacy: do not store the applicant’s personal name, account password, verification code, tax details, payment details, API credentials, or other Associates account secrets.
- Launch remains blocked until links are Amazon-provided Special Links, the current site statement and link-level disclosures are present, product content follows current Program Content rules, operator/contact/jurisdiction requirements are complete, and qualified review is recorded.

## Production-readiness record

Owner-provided facts recorded 2026-08-07 and updated 2026-08-08:

- Public operator/brand name: `WantCove`. The legal entity or individual identity behind that name has not been reviewed, so this is not a completed legal-identity record.
- Location: Tennessee, United States. Applicable Tennessee and United States requirements, governing-law language, privacy rights, and dispute terms have not received jurisdiction-specific review.
- Public contact: `wantcove@gmail.com`. On 2026-08-08 the owner confirmed that the mailbox was created and will be monitored for WantCove contact and privacy requests. It may be published as the active contact method. The website uses a `mailto:` handoff rather than a contact form; Google/Gmail and the sender's email provider process the resulting message.
- Qualified legal review: not started.
- Release status: Production and commercial affiliate links remain blocked. `.agents/PRODUCTION_READINESS.json` is the machine-readable source for this status, and `npm run verify:release` must fail until the required reviews and contact verification are truthfully complete.

## Release checklist

1. Compare the release against both trigger lists.
2. Confirm the policies describe actual behavior and vendors, not planned or assumed behavior.
3. Update dates, policies, tests, and the project log together.
4. Record operator identity, monitored contact channel, governing jurisdiction, and counsel review before Production or commercial links.
5. Block Production when required legal details, consent flows, disclosures, or jurisdiction-specific notices are incomplete.
6. Keep `.agents/PRODUCTION_READINESS.json` aligned with verified facts and run `npm run verify:release`; never mark a field complete based on a planned value or assumption.

## Authoritative references reviewed 2026-08-06

- FTC Endorsement Guides Q&A: https://consumer.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking
- FTC privacy and security guidance: https://www.ftc.gov/business-guidance/privacy-security
- Amazon Associates Operating Agreement: https://affiliate-program.amazon.com/help/operating/agreement
- Amazon Associates disclosure help: https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98

Recheck current program terms and applicable law before activation; references can change.
