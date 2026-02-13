# Blair AI Fax Sorter
## Proposal for KMH Cardiology Clinics

**Date:** February 2026
**Prepared by:** Blair AI

---

## 1. Introduction

### About Blair AI

Blair AI specializes in intelligent healthcare automation solutions designed for Canadian specialty clinics. Our team combines deep healthcare domain expertise with cutting-edge AI technology to solve the operational challenges that slow down patient care.

### Understanding KMH's Needs

KMH Cardiology Clinics processes thousands of incoming faxes monthly—referrals, ECGs, lab results, and clinical correspondence. Manual triage consumes staff time, introduces delays, and risks lost documents. Your RFP outlines clear requirements for reliable classification, efficient workflows, and seamless integration with your existing systems.

### Our Solution: Blair

Blair is an AI-powered fax sorting and referral management system purpose-built for cardiology clinics. Blair reduces manual triage time by **90%** while ensuring **100% referral completeness** before physician review. With intelligent document classification, real-time SLA tracking, and automated follow-up communications, Blair transforms your fax inbox from a bottleneck into a streamlined workflow.

---

## 2. RFP Requirements Compliance

### 2.1 Reliable End-to-End Fax Indexing with Classification

Blair's AI processing engine performs OCR text extraction and document type detection on every incoming fax. The system supports multiple document types common to cardiology clinics—referrals, ECGs, bloodwork, echocardiograms, consult notes—and displays confidence scores so staff know which items need manual verification. Handwritten documents are processed through specialized OCR models, with low-confidence extractions automatically flagged for human review.

📄 [See PRD Section 4.1: Master Fax Processing Flow](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#41-master-fax-processing-flow)

---

### 2.2 Document Splitting by Patient and Category

Multi-patient faxes are detected automatically and flagged for splitting. The Split Tool provides a visual page strip interface where clerks click between pages to create segment markers. Each segment becomes a separate fax record with its own patient assignment, ensuring documents are never misfiled when multiple referrals arrive on a single fax.

📄 [See PRD Section 4.3: Document Splitting Flow](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#43-document-splitting-flow)

---

### 2.3 Automatic Document Classification and Filing

Documents are automatically classified into categories (Referral, ECG, Lab Results, etc.) and filed to appropriate folders based on configurable confidence thresholds. The Auto-File Settings page allows administrators to set per-document-type thresholds, ensuring conservative handling of clinical documents while automating administrative paperwork.

📄 [See PRD Section 5.8.1: Auto-File Settings](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#581-auto-file-settings-settingsauto-file)

---

### 2.4 Searchable Interface

The Fax Inbox provides global search across patient name, referring physician, document type, and fax number. Filter buttons enable quick toggling between urgent items, those needing review, and items by status. Advanced filters support date ranges, fax line selection, and completeness status for comprehensive document retrieval.

📄 [See PRD Section 5.2: Fax Inbox](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#52-fax-inbox-inbox)

---

### 2.5 Worklist Model with SLAs and Record Locking

The Worklist presents a unified queue where staff claim items for processing. Visual SLA timers count down with color progression (green → yellow → red) as deadlines approach. Record locking prevents concurrent edits—when one user is working on a fax, others see a lock indicator and warning banner. Priority badges (Urgent/Routine) ensure critical items surface first.

📄 [See PRD Section 5.3: Worklist](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#53-worklist-worklist)

---

### 2.6 AI/OCR Accuracy with Hybrid Approach

Blair's hybrid AI approach balances accuracy and cost-efficiency. Confidence scores are displayed for all AI detections, and low-confidence items are automatically flagged for manual review. Shadow Mode enables pilot testing—AI processes and classifies documents, but all items require human confirmation during the validation period. Performance metrics (accuracy, override rate, time saved) are tracked for continuous improvement.

📄 [See PRD Section 3.1: Core UX Logic](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#31-core-ux-logic)

---

### 2.7 Integration Architecture

Blair integrates with your existing systems: **SRFax** for fax reception and transmission, **Cerebrum EMR** for patient matching and document routing, **Salesforce** for physician directory data, **Zendesk** for support ticket escalation, and **Slack** for real-time team notifications. Each integration has a dedicated monitoring page for visibility into sync status and error handling.

📄 [See PRD Section 6: Integration Architecture](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#6-integration-architecture)

---

### 2.8 Canadian Data Residency and Healthcare Experience

Blair is designed specifically for Canadian specialty clinics with built-in support for Ontario health cards (OHIP), Canadian physician identifiers (CPSO numbers), and provincial health number fields. The system architecture supports Canadian data residency requirements with infrastructure deployed in Canadian regions.

📄 [See PRD Section 8: RFP Requirements Fulfillment](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#8-rfp-requirements-fulfillment)

---

### 2.9 Pilot-First Path for Validation

Shadow Mode provides a safe pilot path for accuracy validation. During pilot, AI processes all documents but none are auto-filed—staff review every item while the system learns from corrections. Performance dashboards track auto-file accuracy, staff override rates, and processing time improvements, providing data to confidently transition to production mode.

📄 [See PRD Section 5.8.1: Auto-File Settings (Shadow Mode)](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#581-auto-file-settings-settingsauto-file)

---

### 2.10 Outbound Communication Module

The Compose slide-over enables staff to request missing items via fax, email, or AI-powered phone calls. Template-based messaging auto-populates patient details and missing item lists. Follow-up reminders can be scheduled automatically, and AI voice agents can place calls to referring offices, providing transcripts of conversations for audit trails.

📄 [See PRD Section 5.7: Compose Slide-Over](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md#57-compose-slide-over)

---

## 3. Implementation Timeline

### 10-Week Rollout Plan

| Phase | Weeks | Activities |
|-------|-------|------------|
| **Discovery & Setup** | 1-2 | Requirements finalization, environment provisioning, integration credentials |
| **Integration Development** | 3-5 | SRFax webhook setup, Cerebrum API connection, Salesforce sync, Slack/Zendesk config |
| **AI Training & Tuning** | 4-6 | Document type training on KMH samples, confidence threshold calibration |
| **Shadow Mode Pilot** | 6-8 | Staff training, parallel processing, accuracy validation, workflow refinement |
| **Production Rollout** | 9-10 | Gradual auto-file enablement, go-live support, performance monitoring |

### Gantt Chart

```
Week:          1    2    3    4    5    6    7    8    9    10
               ════════════════════════════════════════════════
Discovery      ████████
Integration         ██████████████████
AI Training              ██████████████████
Shadow Pilot                  ██████████████████
Production                                   ████████
               ════════════════════════════════════════════════
```

**Key Milestones:**
- **Week 2**: Integration credentials collected, environments provisioned
- **Week 5**: All integrations connected and tested
- **Week 6**: AI model trained on KMH document samples
- **Week 8**: Shadow Mode validation complete, accuracy targets met
- **Week 10**: Production go-live with auto-filing enabled

---

## 4. Pricing

### Volume-Based Fax Processing

| Monthly Volume | Per-Fax Rate |
|----------------|--------------|
| 0 – 10,000 faxes | **$0.15** |
| 10,001 – 40,000 faxes | **$0.12** |
| 40,001+ faxes | **$0.10** |

### What's Included

- AI document classification and OCR processing
- Patient matching against Cerebrum EMR
- SLA tracking and breach notifications
- All integration connections (SRFax, Cerebrum, Salesforce, Zendesk, Slack)
- Dedicated support channel
- Dashboard analytics and reporting

### Implementation

One-time setup fee to be quoted based on integration complexity and customization requirements. Includes:
- Integration development and testing
- AI model training on your document samples
- Staff training sessions
- Shadow Mode pilot support

---

## 5. Next Steps

1. **Technical Discovery Call**
   Review integration requirements, data flows, and technical architecture with your IT team.

2. **Sample Document Review**
   Provide sample faxes (referrals, ECGs, lab results) for AI training and threshold calibration.

3. **Pilot Agreement**
   Define success criteria, timeline, and scope for Shadow Mode pilot.

---

## Appendix

📄 **Full Product Requirements Document**
[Blair PRD on GitHub](https://github.com/Optimal-Research-Team/blair/blob/main/docs/BLAIR_PRD.md)

📄 **Live Demo**
Available upon request

---

*Prepared by Blair AI*
*For questions, please contact your account representative.*
