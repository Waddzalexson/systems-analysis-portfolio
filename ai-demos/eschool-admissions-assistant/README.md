# eSchool Explore

A responsive school discovery and admissions concept built for a technical portfolio. It demonstrates practical product thinking, structured data handling, backend integration, explainable search, missing-data safeguards and an optional LLM extension.

**[Open the live interactive demo](https://waddzalexson.github.io/systems-analysis-portfolio/ai-demos/eschool-admissions-assistant/web/demo.html)**

This is an independent concept by Alex Wadaba. All school names, fees and admissions information are fictional. It is not the official eSchool product and does not submit real applications.

## What you can try

1. Search naturally: "Primary school in Kampala under UGX 4 million".
2. Narrow by location, school level, curriculum, boarding, budget and admissions status.
3. Save schools to your shortlist and compare up to three side by side.
4. Open school details to see fees, admission status and any missing deadlines.
5. Preview the application journey and checklist without submitting personal information.
6. Ask the school guide about fees, boarding options or deadlines. It uses recorded evidence rather than guessing.
7. Try a request with no matching schools to see the empty state and recovery options.

## Illustrative photography

The school cards use real photographs from Unsplash. The pictures are **illustrative only**. They do not depict the fictional schools or verify the listed fees, facilities or admission details.

Photo source pages:

- [School exterior](https://unsplash.com/photos/a-school-building-surrounded-by-greenery-under-a-blue-sky-eZjpArlRqZ4)
- [Campus building](https://unsplash.com/photos/a-colorful-school-building-and-playground-siDUeDNlxoY)
- [School gardens](https://unsplash.com/photos/a-building-with-a-garden-and-trees-in-front-PkR6tOoKAVU)
- [Classroom](https://unsplash.com/photos/empty-classroom-with-desks-and-chairs-eDLsRfSnrC0)
- [Playground](https://unsplash.com/photos/schoolyard-with-running-track-and-buildings-beyond-city-buildings-AUzOmtVVFGs)
- [Sports facilities](https://unsplash.com/photos/a-basketball-court-in-front-of-a-red-building-RZ4LtWXa9h0)
- [Classroom interior](https://unsplash.com/photos/empty-classroom-with-desks-and-chairs-by-windows-rkH8YVmjQ4w)
- [Library](https://unsplash.com/photos/a-library-aisle-with-bookshelves-and-sunlight-through-window-xmeRBPunJR8)

Images are loaded from Unsplash and require an internet connection to display. Review the [Unsplash License](https://unsplash.com/license) before reuse in another product.

## Two run modes

### Public demo (GitHub Pages)

The public UI works entirely in the browser, using a small set of fictional, verified sample records. Search, explanations, comparison and shortlisting function without a server. It is intentionally deterministic and **does not claim to run an LLM**.

The saved-school list stores only synthetic school IDs in your browser's local storage. No parent or pupil details are requested or transmitted.

### Python backend (local)

Run the optional API from the root of this demo folder:

```bash
python backend/server.py
```

Open `http://127.0.0.1:8088/demo.html`. This mode serves the same interface and automatically uses the Python API for searches and questions. The server includes:

- `GET /api/health`
- `GET /api/schools`
- `POST /api/search`
- `POST /api/ask`

The rules engine enforces verified-field filters and generates a grounding bundle that contains only known facts and explicit missing values.

### Optional LLM adapter

The backend contains an optional OpenAI Responses API adapter. It is **disabled by default** and will not work without a valid API key and chosen compatible model. Set these environment variables on your **server, not in browser code**:

```bash
ENABLE_OPENAI=1
OPENAI_API_KEY=<your-secret-key>
OPENAI_MODEL=<model-you-are-authorized-to-use>
```

When enabled, the API sends only fictional school evidence and the query, checks for referenced record IDs and rejects unsupported UGX amounts. If the model is unavailable or fails validation, the API uses a deterministic answer. These checks reduce error risk but do not guarantee that every model response is accurate. A production system would need stronger validation, access control, rate limiting and monitoring.

**Do not deploy this demonstration backend directly as a production public service.** It binds to localhost by default and is intended for technical demonstration.

## Engineering approach

- Hard constraints, fees, admissions status and roles are handled deterministically.
- The school guide gives grounded responses and flags unavailable information.
- A Python retrieval example demonstrates TF-IDF text relevance, while the lightweight API prioritizes explicit filters and low-cost ranking.
- Public school discovery data is separate from private parent, student or school-admin records.
- No actual school data, client information or secrets are committed.

See [architecture.md](architecture.md) for design choices and known limitations.

## Tests

Install Python test dependencies if needed:

```bash
pip install -r requirements.txt
python -m pytest tests/test_retriever.py tests/test_engine.py tests/test_api.py -q
```

The browser smoke test is in `tests/test_ui.py`. It requires Playwright and Chromium. It checks search, filters, comparison, saved schools, application preview, missing data, empty results, the question guide and responsive layouts.

## A quick interview walkthrough

1. Search for a primary school in Kampala under UGX 4 million.
2. Save both matching schools and open Compare.
3. View a school's details, then the application checklist.
4. Search for a Cambridge boarding school in Wakiso and point out the missing deadline.
5. Explain how the optional Python API retrieves verified facts before a model is allowed to generate an answer.

## About

Built by Alex Wadaba to demonstrate business analysis, systems design, backend engineering and careful AI feature integration.