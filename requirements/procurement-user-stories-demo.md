# Procurement User Stories and Acceptance Criteria

## US-01 Create requisition

**As a** requester  
**I want** to create a purchase requisition with the required information  
**So that** the procurement process starts with a complete and traceable request.

### Acceptance criteria

- requester and department are recorded
- purpose is required
- at least one item or service is required
- expected cost is required
- incomplete requests cannot be submitted
- submitted request receives a unique reference number

## US-02 Review department request

**As a** Department Head  
**I want** to approve or reject a submitted request  
**So that** only justified departmental needs move forward.

### Acceptance criteria

- reviewer can see request details and attachments
- approve and reject actions are available only to authorised users
- rejection requires a reason
- decision is timestamped and stored in the request history

## US-03 Record sourcing evidence

**As a** Procurement Officer  
**I want** to attach quotations and document the supplier recommendation  
**So that** the sourcing decision can be reviewed later.

### Acceptance criteria

- quotation files can be attached
- supplier name and quoted amount can be recorded
- recommended supplier is clearly identified
- recommendation cannot move forward until required sourcing information is complete

## US-04 Confirm receipt

**As a** Receiving Officer  
**I want** to confirm whether goods or services were received  
**So that** finance can distinguish delivered requests from outstanding ones.

### Acceptance criteria

- receipt date is captured
- receiving user is captured
- partial or complete receipt can be distinguished if configured
- payment-preparation completion is blocked until required receipt confirmation exists

## US-05 Track status

**As a** requester  
**I want** to see the current status and outstanding action  
**So that** I do not need to contact finance or procurement for routine status updates.

### Acceptance criteria

- current status is visible
- latest action date is visible
- outstanding role or step is visible where appropriate
- requester cannot view requests outside authorised scope
