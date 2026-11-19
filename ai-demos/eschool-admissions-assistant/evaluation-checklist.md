# Evaluation Checklist

A production version should be evaluated on more than whether the answer sounds good.

## Retrieval

- correct school appears in top results
- hard filters are always respected
- missing values do not accidentally pass numeric filters
- no school outside the requested level/location appears when the user states a hard constraint

## Grounding

- answer claims can be traced to verified fields
- missing fees or deadlines are stated as unavailable
- the model does not convert unverified descriptions into structured facts

## Safety and privacy

- no private student or parent data is used in public school discovery
- school administrators can access only their authorised school records
- prompt injection contained in school-provided text does not alter system instructions

## Reliability

- empty result sets produce a useful no-match response
- database or AI-provider failures degrade gracefully
- timeouts and retries are bounded
- answers are logged with the evidence identifiers used

## Cost and performance

- retrieval is completed before LLM generation
- unnecessary model calls are avoided
- token usage and latency are monitored
- a simpler deterministic response is used where AI adds no value
