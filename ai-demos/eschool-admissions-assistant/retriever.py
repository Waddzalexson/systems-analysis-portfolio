from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class SearchResult:
    school: dict[str, Any]
    score: float
    evidence: list[str]
    missing: list[str]


def load_schools(path: str | Path) -> list[dict[str, Any]]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _text_for_school(school: dict[str, Any]) -> str:
    parts: Iterable[str] = [
        school.get("name") or "",
        school.get("location") or "",
        " ".join(school.get("curriculum") or []),
        " ".join(school.get("levels") or []),
        school.get("description") or "",
    ]
    return " ".join(parts)


def _passes_filters(school: dict[str, Any], filters: dict[str, Any] | None) -> bool:
    if not filters:
        return True

    if filters.get("location") and school.get("location", "").lower() != str(filters["location"]).lower():
        return False

    if filters.get("boarding") is not None and school.get("boarding") is not filters["boarding"]:
        return False

    if filters.get("admissions_open") is not None and school.get("admissions_open") is not filters["admissions_open"]:
        return False

    max_fee = filters.get("max_annual_fee_ugx")
    if max_fee is not None:
        fee = school.get("annual_fee_ugx")
        if fee is None or fee > max_fee:
            return False

    curriculum = filters.get("curriculum")
    if curriculum:
        curricula = [x.lower() for x in school.get("curriculum") or []]
        if str(curriculum).lower() not in curricula:
            return False

    level = filters.get("level")
    if level:
        levels = [x.lower() for x in school.get("levels") or []]
        if str(level).lower() not in levels:
            return False

    return True


def _evidence_and_missing(school: dict[str, Any]) -> tuple[list[str], list[str]]:
    fields = [
        "location",
        "curriculum",
        "levels",
        "boarding",
        "annual_fee_ugx",
        "admissions_open",
        "application_deadline",
    ]
    evidence: list[str] = []
    missing: list[str] = []

    verified = set(school.get("verified_fields") or [])
    for field in fields:
        value = school.get(field)
        if value is None or value == "" or value == []:
            missing.append(field)
        elif field in verified:
            evidence.append(f"{field}={value}")

    return evidence, missing


def search_schools(
    query: str,
    schools: list[dict[str, Any]],
    filters: dict[str, Any] | None = None,
    top_k: int = 3,
) -> list[SearchResult]:
    candidates = [s for s in schools if _passes_filters(s, filters)]
    if not candidates:
        return []

    corpus = [_text_for_school(s) for s in candidates]
    vectorizer = TfidfVectorizer(stop_words="english")
    matrix = vectorizer.fit_transform(corpus + [query])
    similarities = cosine_similarity(matrix[-1], matrix[:-1]).flatten()

    ranked = sorted(zip(candidates, similarities), key=lambda x: x[1], reverse=True)
    results: list[SearchResult] = []
    for school, score in ranked[:top_k]:
        evidence, missing = _evidence_and_missing(school)
        results.append(SearchResult(school=school, score=float(score), evidence=evidence, missing=missing))
    return results


def build_grounding_context(results: list[SearchResult]) -> dict[str, Any]:
    """Return a provider-neutral evidence bundle for an LLM or deterministic UI."""
    return {
        "answer_policy": {
            "use_only_supplied_evidence": True,
            "state_missing_information": True,
            "do_not_infer_unverified_fees_or_deadlines": True,
            "recommend_human_confirmation_for_application_deadlines": True,
        },
        "schools": [
            {
                "id": r.school["id"],
                "name": r.school["name"],
                "score": round(r.score, 4),
                "evidence": r.evidence,
                "missing": r.missing,
            }
            for r in results
        ],
    }


if __name__ == "__main__":
    schools = load_schools(Path(__file__).with_name("sample_schools.json"))
    results = search_schools(
        "I need a primary school in Kampala with fees under four million shillings",
        schools,
        filters={"location": "Kampala", "level": "Primary", "max_annual_fee_ugx": 4_000_000},
    )
    print(json.dumps(build_grounding_context(results), indent=2))
