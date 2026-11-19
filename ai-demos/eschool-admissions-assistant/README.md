# AI-Assisted School Admissions and Parent Support Demo

A small public prototype showing how an AI feature for a school-discovery platform can be designed around **grounded data, explicit edge cases and controlled generation** rather than treating an LLM as the source of truth.

This is a fictional portfolio demonstration. The school records are synthetic and are not real institutions.

## Problem

Parents may ask questions such as:

- Which primary schools in Kampala fit my budget?
- Which schools offer Cambridge curriculum and boarding?
- Is admission still open?
- What is the application deadline?

An LLM can make these interactions easier, but it should not invent fees, deadlines, admission status or school details when the platform data is incomplete.

## What this prototype demonstrates

- structured filtering for hard constraints
- text retrieval for relevance ranking
- evidence bundles for grounding an LLM response
- explicit handling of missing data
- no-match behaviour instead of fabricated recommendations
- separation of retrieval logic from the generation layer
- tests for important edge cases
- provider-neutral architecture that can later support an LLM API

## Files

- \`retriever.py\` - structured filtering, text ranking and grounding bundle generation
- \`sample_schools.json\` - synthetic example data
- \`architecture.md\` - system design, failure modes and production extensions
- \`evaluation-checklist.md\` - reliability, privacy, retrieval and cost evaluation
- \`tests/test_retriever.py\` - targeted edge-case tests

## Run locally

\`\`\`bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python retriever.py
pytest -q
\`\`\`

## Design choice: when not to use AI

Hard business rules, numeric filters, permissions and admissions status checks should remain deterministic. An LLM is most useful after retrieval, where it can explain verified results in natural language, ask clarifying questions and help a parent understand options.

## Possible next step

Add a small API layer and an LLM response adapter that accepts only the generated evidence bundle. The response should cite school record IDs and refuse to answer unsupported factual questions.
