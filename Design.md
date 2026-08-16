# Design.md — Product Design System

## Design Direction

Create a premium institutional equity-research interface.

Visual references in spirit:

- Bloomberg Terminal
- TradingView
- modern institutional research platforms
- premium financial dashboards

Do not copy any proprietary interface.

## Visual Character

The product should feel:

- analytical
- serious
- dense but readable
- trustworthy
- information-rich
- premium
- fast
- professional

Avoid:

- excessive gradients
- childish illustrations
- generic AI chat UI
- excessive glassmorphism
- giant empty spaces
- excessive rounded cards
- unnecessary animations

## Theme

Primary:

deep dark financial terminal aesthetic.

Use neutral dark surfaces with restrained accent colours.

Positive:

green

Negative:

red

Warning:

amber

Neutral:

blue/gray

Do not use colour as the only indicator.

## Typography

Use a highly readable modern sans-serif.

Financial numbers should use tabular numerals where supported.

Hierarchy:

H1 — report/company title
H2 — analysis section
H3 — metric/group
Body — explanation
Caption — source/provenance

## Dashboard

Top area:

Company
Ticker
Current price
Market cap
Overall verdict
Conviction
Research freshness

Then:

- business snapshot
- financial health
- valuation
- technical structure
- catalysts
- risks

## Research Navigation

Use persistent navigation:

Overview
Fundamentals
Forensic
Management
Valuation
Technical
Industry
News
Catalysts
Risks
Scenarios
Verdict
Evidence

## Evidence UX

Every major claim should have an evidence affordance.

Example:

`Cash conversion deteriorated`

[View evidence]

The evidence panel should show:

Metric
Period
Calculation
Source
Page
Confidence

## Confidence

Use:

High
Medium
Low
Conflicting

Do not use fake numerical confidence unless the scoring methodology is clearly defined.

## Financial Tables

Tables should support:

- period comparison
- YoY growth
- margin
- trend indicator
- source

Allow horizontal scrolling on mobile.

## Charts

Prefer charts for:

- revenue
- EBITDA
- PAT
- CFO
- FCF
- debt
- ROCE
- margins
- valuation history
- ownership

Charts must never imply data that does not exist.

## Verdict Component

Prominent final section:

BUY / HOLD / AVOID

Conviction: X/10

Then:

Why
What could change the thesis
Catalysts
Risks
Valuation condition

## Technical Section

Display:

- price chart
- trend
- structure
- support
- resistance
- volume
- confidence

Clearly distinguish chart-derived observations from verified market data.

## Responsive Design

Desktop:

research-terminal experience.

Tablet:

compressed multi-column layout.

Mobile:

single-column priority layout.

Do not simply shrink desktop components.

## Accessibility

Support:

- keyboard navigation
- visible focus states
- semantic HTML
- screen-reader labels
- sufficient contrast
- reduced motion

## Animation

Use subtle animation only when it improves comprehension.

Never animate financial numbers unnecessarily.

## Loading

Long research processes should show meaningful stages:

Uploading
Parsing
Extracting
Validating
Researching
Analysing
Cross-checking
Generating report

## Error States

Errors should explain:

what failed
why it may have failed
what the user can do

Never display raw technical errors as the only message.

## Overall Principle

Information density should be high, but cognitive load should remain controlled through hierarchy, spacing, grouping and progressive disclosure.