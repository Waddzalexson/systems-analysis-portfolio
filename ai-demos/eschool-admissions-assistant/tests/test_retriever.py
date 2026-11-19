from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from retriever import build_grounding_context, load_schools, search_schools

DATA = Path(__file__).parents[1] / 'sample_schools.json'


def test_budget_filter_results():
    schools = load_schools(DATA)
    results = search_schools('primary school in Kampala', schools,filters={'location':'Kampala','level':'Primary','max_annual_fee_ugx':4_000_000})
    assert {r.school['id'] for r in results} == {'sch-001','sch-006'}


def test_missing_fees_not_treated_as_free():
    schools = load_schools(DATA)
    results = search_schools('nursery in Kampala',schools,filters={'level':'Nursery','max_annual_fee_ugx':5_000_000})
    assert results == []


def test_grounding_missing_deadline():
    schools = load_schools(DATA)
    results = search_schools('Cambridge boarding',schools,filters={'location':'Wakiso','curriculum':'Cambridge'})
    ctx = build_grounding_context(results)
    assert ctx['schools'][0]['id']=='sch-002'
    assert 'application_deadline' in ctx['schools'][0]['missing']
    assert ctx['answer_policy']['use_only_supplied_evidence'] is True