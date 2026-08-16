# End-to-End Testing

## Purpose

End-to-end tests simulate real user workflows through the Stock Analyzer application.

## Core User Journey

The primary E2E workflow should eventually cover:

1. Open application.
2. Create research project.
3. Enter company.
4. Upload documents.
5. Process documents.
6. Extract financial information.
7. Review evidence.
8. Run company analysis.
9. View financial analysis.
10. View forensic analysis.
11. View management analysis.
12. View valuation.
13. View technical analysis.
14. View current developments.
15. View risks and catalysts.
16. View scenarios.
17. View final verdict.
18. Open supporting evidence.

## Error Workflows

Test:

- invalid file
- oversized file
- corrupted PDF
- failed extraction
- missing data
- conflicting sources
- failed external API
- analysis failure
- network failure

## Browser Verification

E2E tests should verify:

- page navigation
- forms
- uploads
- loading states
- error states
- report rendering
- evidence interaction
- responsive behaviour

## Rule

E2E tests must test real user workflows rather than isolated implementation details.