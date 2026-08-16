# Development Scripts

## Purpose

This directory contains developer and CI automation scripts.

## Rules

Scripts must:

- have one clear responsibility
- fail clearly when validation fails
- return appropriate exit codes
- avoid destructive operations unless explicitly intended
- never expose secrets
- never contain production credentials

## Planned Scripts

### preflight

Validate the local development environment.

### validate-financial-data

Validate extracted financial data.

### check-provenance

Check whether material financial facts have adequate provenance.

### verify-research

Run research verification checks.

### seed-development-data

Create deterministic synthetic data for development/testing.

### clean-development-data

Remove development-only generated data safely.

## Important

Development fixtures and synthetic data must never be presented as real company financial information.