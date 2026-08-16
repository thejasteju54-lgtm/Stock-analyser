---
trigger: always_on
---

# Coding Standards

## General

Write production-quality code.

Prefer:

- simple architecture
- strong typing
- modular design
- reusable components
- explicit interfaces
- deterministic business logic
- testable functions
- clear naming

Avoid unnecessary complexity.

## Before Modifying Code

Inspect:

- existing implementation
- related components
- dependencies
- types
- tests
- configuration

Do not rewrite existing code without understanding it.

## Architecture

Keep business logic outside UI components.

Separate:

- presentation
- domain logic
- data access
- external APIs
- financial calculations
- AI orchestration
- validation

## Type Safety

Avoid unnecessary:

- `any`
- unsafe casts
- ignored TypeScript errors
- unchecked external data

Validate external data at boundaries.

## Financial Calculations

Critical financial calculations must be deterministic.

Do not place important arithmetic inside prompts or UI components.

## API Handling

Every external API should handle:

- loading
- success
- partial success
- failure
- timeout
- retry where appropriate
- malformed responses
- rate limits

Never silently return fake production data.

## Environment Variables

Never hardcode:

- API keys
- tokens
- credentials
- secrets
- private URLs

Validate required environment variables during startup.

## Components

Prefer small components with clear responsibilities.

Avoid giant components containing:

- API calls
- financial calculations
- state management
- rendering
- business rules

## Error Handling

Errors must be:

- captured
- logged appropriately
- communicated to the user
- recoverable where possible

Never hide errors just to make the UI appear functional.

## Dependencies

Do not install a dependency merely because it is convenient.

Before adding one:

1. Check whether existing dependencies solve the problem.
2. Check whether the dependency is maintained.
3. Consider bundle size.
4. Consider security.
5. Consider whether the dependency is actually necessary.

## Performance

Avoid:

- unnecessary re-renders
- repeated API calls
- duplicate calculations
- loading entire documents when targeted retrieval is sufficient

Use pagination, lazy loading and caching when justified.

## Accessibility

Use:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast

Do not rely solely on colour.

## Code Quality

Before completion:

- remove dead code
- remove debug statements
- remove unused imports
- remove temporary hacks
- remove duplicated logic

## Comments

Comment the reasoning behind complex decisions.

Do not add comments that merely repeat obvious code.

## No Fake Features

Do not create UI that implies functionality that does not exist.

If a feature is not implemented, do not make it appear production-ready.

## Core Principle

Prefer boring, understandable and testable code over clever code.