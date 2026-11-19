# AI-Assisted School Admissions and Parent Support Demo

A public portfolio prototype demonstrating school discovery with structured filters, explainable recommendations, missing-data checks and evidence-based answering.

**This is an independent demonstration, not an official eSchool product.** All school records, fees and admissions information are fictional.

## Visual demo

**[View the interactive web interface](web/demo.html)**

The demo contains a responsive parent-facing search page with:
- Example school questions and a natural-language-inspired search field
- Location, level and fee filters
- School cards, recorded admissions status and annual fee details
- An assistant panel explaining what each result is based on
- Explicit notices when fees or deadlines are missing
- No-match handling and accessible reset actions

To try it, download `web/demo.html` and open it in a browser. It is a self-contained HTML file with no external requests.

## Engineering demonstration

This portfolio also contains a separate Python retrieval prototype:

- [`retriever.py`](retriever.py): structured filtering, TF-IDF ranking and evidence bundle creation
- [`sample_schools.json`](sample_schools.json): fictional example data
- [`architecture.md`](architecture.md): system design and failure scenarios
- [`evaluation-checklist.md`](evaluation-checklist.md): reliability, privacy, performance and cost considerations
- [`tests/test_retriever.py`](tests/test_retriever.py): targeted edge-case tests

### Run the Python prototype

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python retriever.py
pytest -q
```

## Scope and current limitations

The HTML experience uses deterministic browser-side filtering and keyword matching; the Python script demonstrates evidence retrieval separately. The two parts are not yet connected through an API.

**There is no live LLM API or real admissions integration in the demo.** It intentionally illustrates the user experience and the engineering controls that would be needed before adding an LLM.

In a production implementation, an LLM would receive only the retrieved evidence, cite record identifiers, and state uncertainty for missing or unverified values. Fees and admission deadlines should be checked with schools directly, and private student data should remain access-controlled.

## Design principle

Use deterministic code for permissions, hard constraints and numeric filtering. Use AI where it genuinely helps interpret a parent's request or explain grounded results, rather than asking it to invent factual school information.
