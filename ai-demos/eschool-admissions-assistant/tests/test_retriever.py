from pathlib import Path

from retriever import build_grounding_context, load_schools, search_schools


DATA = Path(__file__).parents[1] / "sample_schools.json"


def test_filtering_returns_matching_school():
    schools = load_schools(DATA)
    results = search_schools(
        "primary school in Kampala",
        schools,
        filters={"location": "Kampala", "level": "Primary", "max_annual_fee_ugx": 4_000_000},
    )
    assert len(results) == 1
    assert results[0].school["name"] == "Lakeview Academy"


def test_missing_fee_is_not_treated_as_zero():
    schools = load_schools(DATA)
    results = search_schools(
        "nursery in Kampala",
        schools,
        filters={"level": "Nursery", "max_annual_fee_ugx": 5_000_000},
    )
    assert results == []


def test_grounding_context_exposes_missing_fields():
    schools = load_schools(DATA)
    results = search_schools("Cambridge boarding school", schools, filters={"curriculum": "Cambridge"})
    ctx = build_grounding_context(results)
    assert ctx["schools"][0]["name"] == "Greenhill International School"
    assert "application_deadline" in ctx["schools"][0]["missing"]
    assert ctx["answer_policy"]["use_only_supplied_evidence"] is True
