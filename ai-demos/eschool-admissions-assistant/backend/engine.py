"""Grounded school-discovery rules for the independent eSchool portfolio demo."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).resolve().parents[1] / "web" / "sample-schools.json"
FIELDS = ("location", "curriculum", "levels", "boarding", "annual_fee_ugx", "admissions_open", "application_deadline")
STOP = {"the", "schools", "school", "show", "find", "which", "want", "need", "this", "what", "with", "for", "under", "below", "ugx", "million", "in", "and", "all", "have", "cost", "that", "about", "some", "my", "our", "can", "you"}


def load_records(path: Path = DATA_FILE) -> list[dict[str, Any]]:
    return json.loads(path.read_text(encoding="utf-8"))


def known(school: dict[str, Any], field: str) -> bool:
    value = school.get(field)
    return field in school.get("verified_fields", []) and value not in (None, "", [])


def parse_query(query: str) -> dict[str, Any]:
    text = query.lower().strip()
    filters: dict[str, Any] = {}
    for location in ("Kampala", "Wakiso", "Entebbe", "Jinja"):
        if re.search(r"\b" + location.lower() + r"\b", text):
            filters["location"] = location
    for pattern, level in ((r"nursery|early years", "Nursery"), (r"primary", "Primary"), (r"secondary", "Secondary")):
        if re.search(r"\b(?:" + pattern + r")\b", text):
            filters["level"] = level
            break
    if "cambridge" in text:
        filters["curriculum"] = "Cambridge"
    elif "national curriculum" in text:
        filters["curriculum"] = "Uganda National Curriculum"
    if re.search(r"\b(?:no boarding|non.?boarding|day school|day schools)\b", text):
        filters["boarding"] = False
    elif "boarding" in text:
        filters["boarding"] = True
    if re.search(r"\b(?:admissions open|open for admission|currently admitting|accepting applications)\b", text):
        filters["admissions_open"] = True
    m = re.search(r"(?:under|below|less than|up to|maximum|max|not more than|budget(?:\s+of|\s+is)?|cost(?:s|ing)?\s+under)\s*(?:ugx|shs|shillings)?\s*([\d,.]+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(million|m|thousand|k)?\b", text)
    if m:
        numbers = {"one":1,"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8,"nine":9,"ten":10}
        value = numbers.get(m.group(1)) or float(m.group(1).replace(",", ""))
        multiplier = 1_000_000 if m.group(2) in ("million", "m") else 1000 if m.group(2) in ("thousand", "k") else 1
        filters["max_annual_fee_ugx"] = int(value * multiplier)
    return filters


def passes(school: dict[str, Any], filters: dict[str, Any]) -> bool:
    for key, desired in filters.items():
        field = "levels" if key == "level" else "annual_fee_ugx" if key == "max_annual_fee_ugx" else key
        if not known(school, field):
            return False
        value = school[field]
        if key == "max_annual_fee_ugx":
            if not isinstance(value, (int, float)) or value > desired:
                return False
        elif isinstance(value, list):
            if str(desired).lower() not in [str(x).lower() for x in value]:
                return False
        elif isinstance(value, str):
            if value.lower() != str(desired).lower():
                return False
        elif value != desired:
            return False
    return True


def search(query: str = "", extra_filters: dict[str, Any] | None = None, sort: str = "match", records: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    candidates = records if records is not None else load_records()
    filters = parse_query(query)
    allowed = {"location", "level", "curriculum", "max_annual_fee_ugx", "boarding", "admissions_open"}
    if extra_filters:
        filters.update({k:v for k,v in extra_filters.items() if k in allowed and v is not None and v != ""})
    tokens = [t for t in re.split(r"[^a-z0-9]+", query.lower()) if len(t) >= 3 and t not in STOP and not t.isdigit()]
    results = []
    for school in candidates:
        if not passes(school, filters):
            continue
        haystack = " ".join([school["name"],school.get("location", ""), *school.get("levels", []), *school.get("curriculum", []),school.get("description", ""), *school.get("highlights", [])]).lower()
        score = sum(word in haystack for word in tokens)
        if query.strip() and not filters and tokens and score == 0:
            continue
        results.append({"id": school["id"], "score": int(score)})
    school_map = {s["id"]:s for s in candidates}
    if sort == "low":
        results.sort(key=lambda x: (school_map[x["id"]].get("annual_fee_ugx") if known(school_map[x["id"]], "annual_fee_ugx") else float("inf")))
    elif sort == "high":
        results.sort(key=lambda x: -(school_map[x["id"]].get("annual_fee_ugx") if known(school_map[x["id"]], "annual_fee_ugx") else -1))
    elif sort == "name":
        results.sort(key=lambda x: school_map[x["id"]]["name"].lower())
    else:
        results.sort(key=lambda x: (-x["score"], -int(bool(school_map[x["id"]].get("admissions_open"))), school_map[x["id"]]["name"].lower()))
    return results


def grounding(results: list[dict[str, Any]], records: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    all_schools = records if records is not None else load_records()
    map_by_id = {s["id"]:s for s in all_schools}
    items = []
    for r in results:
        s = map_by_id[r["id"]]
        facts = {field:s[field] for field in FIELDS if known(s, field)}
        missing = [field for field in FIELDS if not known(s, field)]
        items.append({"id":s["id"],"name":s["name"],"verified_facts":facts,"missing":missing})
    return {"schools":items,"policy":{"only_verified_fields":True,"state_missing":True,"human_confirmation_required":True}}


def deterministic_answer(query: str, records: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    records = records if records is not None else load_records()
    q = query.lower().strip()
    name_matches = [s for s in records if s["name"].lower() in q or s["name"].split()[0].lower() in q]
    if name_matches:
        s = name_matches[0]
        if re.search(r"deadline|when|closing|apply", q):
            answer = f"{s['name']} lists {s['application_deadline']} as its application deadline." if known(s, "application_deadline") else f"The application deadline for {s['name']} is not available. Please confirm with the school."
        elif re.search(r"fee|cost|budget|price|much", q):
            answer = f"{s['name']} lists UGX {s['annual_fee_ugx']:,} in annual school fees." if known(s, "annual_fee_ugx") else f"{s['name']} has no verified fee in the current data. I cannot estimate the amount."
        else:
            answer = f"{s['name']} is in {s['location']} and offers {', '.join(s.get('levels', []))}."
        return {"answer":answer,"sources":[s["id"]],"mode":"rules"}
    if "deadline" in q:
        count = sum(1 for s in records if known(s, "application_deadline"))
        return {"answer":f"{count} sample schools have recorded deadlines. Other schools have no deadline listed and require confirmation.","sources":[s["id"] for s in records if known(s,"application_deadline")],"mode":"rules"}
    filters = parse_query(query)
    if "boarding" in q and "boarding" not in filters:
        filters["boarding"] = True
    matches = [s for s in records if passes(s,filters)]
    if filters:
        if not matches:
            return {"answer":"No school matches those criteria in the sample records. Try widening the search.","sources":[],"mode":"rules"}
        names = [s["name"] for s in matches[:3]]
        return {"answer":"Schools matching the available details: "+", ".join(names)+(f" and {len(matches)-3} more." if len(matches)>3 else "."),"sources":[s["id"] for s in matches[:3]],"mode":"rules"}
    return {"answer":"I can help compare locations, levels, curricula, boarding, fees and deadlines. Try a question about one of these.","sources":[],"mode":"rules"}