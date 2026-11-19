# Evaluation checklist

## Verified in this version

- Eight fictional school records load correctly.
- Structured filtering rejects schools missing a required fee or level.
- Missing deadlines are marked as unavailable, not inferred.
- No-match searches produce a helpful reset path.
- Users can shortlist, compare up to three schools and preview application steps.
- The school guide handles supported fees and deadline questions.
- Python search and grounding APIs return valid responses and reject invalid filters.
- Responsive screenshots and browser interactions have been checked.

## Additional checks before production

- Accurate retrieval and ranking on a representative school catalogue.
- Handling of changed admission deadlines and conflicting school records.
- Robust protection against injection in school descriptions and other external text.
- AI answer evaluation for unsupported claims and edge cases.
- Authentication, role-based school access and multi-tenant isolation.
- Rate limits, API timeouts, incident logging and service monitoring.
- Consent and data retention for any parent or student information.
- Keyboard interaction, screen reader coverage and visual accessibility audit.
- Performance tests for a realistic school dataset.
- Cost monitoring and agreed model/provider choices.