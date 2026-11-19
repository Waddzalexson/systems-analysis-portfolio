# Architecture and engineering decisions

## Objective

Show a practical parent-facing school-search feature that is both useful and defensible in a technical review. The goal is not to build a generic chatbot. It is to support a clear school selection workflow without inventing sensitive facts.

## Public architecture

```
GitHub Pages
   |
   v
Responsive HTML/CSS/JavaScript
   |
   +--> Natural-language-inspired parsing
   +--> Structured filters and keyword ranking
   +--> Verified school records embedded in the page
   +--> Saved schools and comparison (local IDs only)
   +--> Evidence-based school guide
   +--> Local-only application checklist preview
```

The static site remains fully interactive without any server or third-party API. This is deliberate so the demo is available to recruiters without keys, credentials or a paid service.

## Optional backend architecture

```
Local browser
   |
   v
Python HTTP server (same origin)
   |
   +--> /api/search: verified filters + ranking + evidence bundle
   +--> /api/ask: deterministic answer
   +--> optional LLM Responses API adapter
           |
           +--> only verified fictional fields
           +--> check source IDs and monetary claims
           +--> fall back to deterministic answer on failure
```

When the interface is served locally by `backend/server.py`, it marks API mode and the browser calls the Python endpoints. GitHub Pages cannot host the Python backend, so the published demo uses the embedded-data fallback.

## Why these choices

- **Deterministic controls:** School fees, budgets, admissions status and user permissions should not be invented by a language model.
- **Grounding:** Only fields marked verified can be sent as supporting evidence.
- **Explicit missingness:** A missing deadline or fee is never replaced with a guess or zero.
- **Cost awareness:** Structured filtering runs before a model request. The public demo needs no model calls.
- **Resilience:** If a configured LLM endpoint fails, the Python API can produce an ordinary grounded answer.
- **Privacy:** The public demo has no student identities or live school applications. Saved lists use school IDs only.

## Current limitations

- The data is fictional and small; ranking quality is not a benchmark for a production catalogue.
- The sample school guide recognizes specific school-related questions. It is not general-purpose conversational AI.
- The live public site runs client-side search; the Python backend and optional model adapter are demonstrated separately.
- There is no real authentication, live application submission, fee processing or school-admin dashboard.
- The optional LLM adapter requires valid configuration and should be evaluated more thoroughly before production use.
- The backend is a local reference service, not a hardened internet-facing API.

## Production next steps

1. Use a maintained school database, freshness timestamps and a school verification workflow.
2. Add a secure application backend with session management, tenant permissions and API authentication.
3. Keep the model key on the server and enforce budgets, timeouts, usage limits and provider error handling.
4. Evaluate query understanding and retrieval with real user questions and known-correct answers.
5. Monitor unsupported claims and compare generated answers against authoritative records.
6. Add consent, retention and access policies before handling parent or pupil data.
7. Add actual school application integrations and status tracking only after service agreements and permissions are in place.