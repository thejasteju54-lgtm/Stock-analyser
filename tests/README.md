# Testing Architecture

## Purpose

This directory contains automated tests for the Stock Analyzer.

## Unit Tests

Unit tests verify isolated deterministic functionality.

Examples:

- financial calculations
- parsers
- validators
- scoring
- data normalization
- valuation calculations

## Integration Tests

Integration tests verify multiple components working together.

Examples:

- document ingestion
- financial extraction
- database operations
- evidence retrieval
- research pipeline

## Fixtures

Fixtures contain controlled test inputs.

Fixtures must:

- be deterministic
- be clearly labelled
- not contain private user data
- not be mistaken for real production financial data

Synthetic financial data must be clearly marked as synthetic.

## Testing Financial Calculations

Financial calculations must be tested using known inputs and expected outputs.

Include:

- normal cases
- zero values
- missing values
- negative values where valid
- rounding
- unit conversions
- invalid inputs
- extreme values

## AI Testing

Test:

- missing evidence
- contradictory evidence
- OCR errors
- incomplete documents
- prompt injection
- unsupported claims
- hallucination resistance

## Regression Testing

Every important bug fix should receive regression coverage where practical.

## Rule

Tests must validate actual behaviour.

Do not write tests whose only purpose is to make the test suite pass.