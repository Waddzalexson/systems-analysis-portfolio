# Business Requirements Document

## Project

Fictional Procurement Workflow Improvement

## Organisation

Apex Services Ltd, fictional portfolio example

## 1. Purpose

Define the business requirements for a digital procurement workflow that manages purchase requests from initiation through approval, sourcing, receipt and payment preparation.

## 2. Business objectives

- standardise purchase requests
- make approval responsibilities clear
- improve visibility of request status
- keep supporting evidence with the request
- strengthen budget and approval controls
- provide a traceable procurement history

## 3. In scope

- requisition creation and editing before submission
- department approval
- budget confirmation where required
- quotation attachment and evaluation record
- supplier recommendation and approval
- purchase order record
- goods or service receipt confirmation
- invoice attachment and payment-preparation status
- notifications and status history
- basic management reporting

## 4. Out of scope

- supplier payment execution through a bank
- inventory management
- tax filing
- supplier onboarding and due diligence
- integration with an ERP in the first release

## 5. Users and responsibilities

| Role | Responsibility |
|---|---|
| Requester | Creates and follows up own requests |
| Department Head | Reviews business need and department responsibility |
| Finance Officer | Confirms budget or funding treatment |
| Procurement Officer | Manages sourcing and supplier evaluation records |
| Approver | Approves within assigned authority |
| Receiving Officer | Confirms goods or service receipt |
| Administrator | Manages users, roles and reference data |

## 6. Business requirements

| ID | Requirement |
|---|---|
| BR-01 | Every procurement request must have a unique reference number. |
| BR-02 | A request must record requester, department, purpose, items or services, expected cost and required date. |
| BR-03 | The system must prevent submission when mandatory information is missing. |
| BR-04 | Required approval steps must be determined by configured business rules. |
| BR-05 | Users must be able to see the current request status and outstanding action. |
| BR-06 | Procurement evidence must remain linked to the request. |
| BR-07 | Supplier recommendation must record the selected supplier and decision basis. |
| BR-08 | Purchase order information must only be recorded after required approvals. |
| BR-09 | Receipt confirmation must be recorded before payment preparation is completed. |
| BR-10 | Rejections and cancellations must require a reason. |
| BR-11 | Status and approval actions must be timestamped and attributable to a user. |
| BR-12 | Management must be able to report on open, approved, rejected and completed requests. |

## 7. Non-functional expectations

- simple browser-based interface
- role-based access control
- validation of required fields
- readable audit history
- responsive layout for common laptop and tablet sizes
- exportable management reports in a later phase if required

## 8. Success criteria

The first release is successful when the agreed user roles can complete the end-to-end workflow, required controls are enforced, status is visible, and UAT confirms the agreed acceptance criteria.
