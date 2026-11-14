# Future-State Procurement Workflow

> Fictional portfolio demonstration.

```mermaid
flowchart TD
    A[Requester creates requisition] --> B{Required information complete?}
    B -- No --> A
    B -- Yes --> C[Department Head review]
    C -->|Reject| R[Return with reason]
    C -->|Approve| D[Finance budget check if required]
    D -->|Not available| R
    D -->|Available / not required| E[Procurement sourcing]
    E --> F[Record quotations and recommendation]
    F --> G[Approver decision]
    G -->|Reject| R
    G -->|Approve| H[Purchase order record]
    H --> I[Goods or service receipt]
    I --> J[Invoice and document matching]
    J --> K[Payment preparation]
    K --> L[Close request]
```

## Status model

Draft -> Submitted -> Department Review -> Finance Review -> Sourcing -> Approval -> Ordered -> Received -> Payment Preparation -> Closed

Alternative terminal states:

- Rejected
- Cancelled
