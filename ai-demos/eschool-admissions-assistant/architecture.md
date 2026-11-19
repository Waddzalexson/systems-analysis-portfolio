# Architecture and Engineering Decisions

## Goal

Provide parents with useful school-discovery and admissions answers without allowing the AI layer to invent fees, deadlines, availability or school facts that are not present in trusted data.

## Proposed flow

1. Parent asks a natural-language question.
2. Request parser extracts structured constraints where possible, such as location, level, curriculum, boarding preference and fee ceiling.
3. Structured filters remove schools that clearly do not meet hard requirements.
4. Text retrieval ranks the remaining schools for relevance.
5. A grounding bundle is constructed from verified fields only.
6. An LLM can turn the evidence bundle into a natural response.
7. The response layer must state missing information instead of guessing.
8. High-impact details such as application deadlines can require confirmation from a school administrator or verified school feed.

## Why retrieval before generation

A parent asking about a school is usually asking for factual information that already exists in platform data. The AI should therefore retrieve and explain the data rather than generate facts from memory.

## Data model principles

- verified fields are explicitly tracked
- missing values remain missing rather than being converted to defaults
- fees are numeric and currency-specific
- admissions status is separate from application deadline
- school descriptions are searchable, but should not override structured fields

## Failure modes considered

### Missing fees
Do not treat a missing fee as zero or as affordable. The school should be excluded from a hard fee-ceiling filter or clearly marked as needing confirmation.

### Missing deadlines
Do not invent a deadline. State that the deadline is not available in the current data and provide a next action.

### Conflicting school information
Prefer the most recently verified structured field and flag conflicting records for administrative review.

### No matching school
Return no match and suggest relaxing specific filters instead of fabricating a recommendation.

### Prompt injection in school descriptions
Treat school-provided descriptions as data, not instructions to the model. Only trusted system rules should control the answer behaviour.

### Cost control
Use deterministic filtering and retrieval before calling an LLM. Do not spend model tokens on schools that already fail the user's hard constraints.

## Production extensions

- PostgreSQL-backed school catalogue
- embeddings or hybrid lexical/vector retrieval
- row-level access and tenant isolation for school-admin data
- tool calling for application status and admissions workflows
- audit logs for AI answers and evidence used
- offline evaluation set covering common parent questions and known edge cases
- monitoring for unanswered questions, latency, cost and unsupported-answer rate
