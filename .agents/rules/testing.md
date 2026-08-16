---
trigger: always_on
---

# Testing Rules

## Core Rule

Never claim that a feature works without testing it.

## Development Loop

For every meaningful implementation:

1. Implement
2. Typecheck
3. Lint
4. Unit test
5. Integration test where applicable
6. Build
7. Run application
8. Browser-test user workflow where applicable
9. Inspect errors
10. Fix failures
11. Re-run tests

## Never Cheat

Never:

- disable a failing test
- weaken assertions to make tests pass
- suppress TypeScript errors
- hide console errors
- remove functionality to avoid a failure
- mock the exact behaviour being tested

## Unit Tests

Use unit tests for:

- financial calculations
- parsers
- validators
- scoring algorithms
- transformations
- data normalization

## Financial Calculation Tests

Test known inputs and expected outputs.

Include:

- normal values
- zero values
- negative values where valid
- missing values
- extreme values
- rounding
- unit conversion
- division-by-zero cases

## Integration Tests

Test:

- document ingestion
- extraction
- database operations
- API integration
- research pipeline
- evidence retrieval

## End-to-End Tests

Test complete user journeys:

1. Create research project
2. Enter company
3. Upload document
4. Process document
5. Review extracted information
6. Run analysis
7. Open report
8. Inspect evidence
9. View verdict

## Browser Verification

When UI work is completed:

- open the application
- exercise the relevant workflow
- inspect console errors
- inspect network failures
- test loading states
- test error states
- test responsive behaviour

## Document Testing

Test:

- normal PDF
- large PDF
- scanned PDF
- malformed PDF
- image
- long screenshot
- OCR errors
- duplicate documents
- unsupported files

## AI Testing

Test:

- missing evidence
- contradictory evidence
- misleading evidence
- incomplete documents
- prompt injection in documents
- hallucination prevention
- unsupported conclusions

## Regression Testing

After fixing a bug:

1. Add or update a regression test.
2. Run the test.
3. Run relevant existing tests.
4. Run the build.

## Definition of Done

A feature is complete only when relevant tests pass and runtime behaviour has been verified.