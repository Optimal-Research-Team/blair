# Blair - Intelligent Healthcare Referral Management System

**Blair** is a comprehensive AI-powered referral management platform designed for cardiology clinics (demo: Heartland Cardiology). It automates the processing of incoming faxes, intelligently routes referrals based on confidence thresholds, and provides seamless integration with EMR systems, ticketing platforms, and team communication tools.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Core Workflows](#core-workflows)
6. [Page-by-Page Functionality](#page-by-page-functionality)
7. [Integration Feeds](#integration-feeds)
8. [Edge Cases & Error Handling](#edge-cases--error-handling)
9. [State Management](#state-management)
10. [Data Models](#data-models)

---

## Executive Summary

Blair transforms the traditionally manual, paper-heavy process of managing healthcare referrals into an intelligent, automated workflow. The system:

- **Receives faxes** and automatically classifies them by document type (referral, lab report, imaging, etc.)
- **Extracts patient data** using AI to identify names, OHIP numbers, dates of birth, and referring physician information
- **Routes documents** automatically when AI confidence exceeds configurable thresholds
- **Flags edge cases** for human review when confidence is low or critical information is missing
- **Tracks SLAs** to ensure urgent referrals are processed within required timeframes
- **Integrates** with EMR systems (Cerebrum), ticketing (Zendesk), and communication (Slack, Salesforce)

---

## High-Level Architecture

### AI-Powered Document Processing

Blair uses a **confidence-based routing system** with two distinct paths:

```
Incoming Fax
     │
     ▼
┌─────────────────────────────────────────┐
│        AI Document Classification        │
│    (Document Type + Confidence Score)    │
└─────────────────────────────────────────┘
     │
     ├─── Confidence >= Threshold (e.g., 85%) ───► AUTO-ROUTE
     │                                              │
     │                                              ▼
     │                                    ┌─────────────────┐
     │                                    │  Filed to EMR   │
     │                                    │  (No Human      │
     │                                    │   Review)       │
     │                                    └─────────────────┘
     │
     └─── Confidence < Threshold ───► HUMAN REVIEW QUEUE
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  Fax Inbox /    │
                                    │  Review Panel   │
                                    └─────────────────┘
```

### Document Type Workflows

Blair handles different document types with specialized workflows:

#### 1. Referral Faxes
- **Full referral pipeline**: Triage → Incomplete → Pending Review → Routed/Declined
- **AI extracts**: Patient demographics, referring physician, reason for referral, urgency indicators
- **Completeness checking**: Validates presence of required fields (OHIP, DOB, diagnosis, etc.)
- **Priority queue**: Urgent referrals bubble to top of worklist

#### 2. Non-Referral Documents (Lab Results, Imaging, Consult Notes, etc.)
- **Simpler workflow**: Unassigned → Assigned → Filed
- **Patient matching**: AI attempts to match document to existing EMR patient
- **Manual assignment**: If no match found, staff can search and assign manually

#### 3. Unclassified Faxes
- **Held for review**: Documents that AI cannot confidently classify
- **Manual classification**: Staff reviews and assigns document type
- **Spam detection**: Option to mark as junk/spam for future training

### Confidence Threshold System

Each document type has its own configurable confidence threshold:

| Document Type | Default Threshold | Auto-File Behavior |
|--------------|-------------------|-------------------|
| Referral | 85% | Creates referral record, routes to triage |
| Lab Report | 90% | Files directly to matched patient chart |
| Imaging | 90% | Files to patient chart with imaging category |
| Consult Note | 85% | Files as clinical correspondence |
| Insurance Form | 80% | Routes to admin queue |

**Shadow Mode**: When enabled, the system logs what it *would* auto-file without actually doing so, allowing administrators to validate AI accuracy before enabling full automation.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Components** | shadcn/ui (Radix UI primitives) |
| **State Management** | Zustand |
| **Date Handling** | date-fns |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Fonts** | Geist (via next/font) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/blair.git
cd blair

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

The easiest deployment option is [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel auto-detects Next.js and deploys

---

## Core Workflows

### Referral Processing Pipeline

```
┌──────────┐    ┌────────────┐    ┌─────────────────┐    ┌─────────┐
│  TRIAGE  │───►│ INCOMPLETE │───►│ PENDING-REVIEW  │───►│ ROUTED  │
└──────────┘    └────────────┘    └─────────────────┘    └─────────┘
     │                │                    │
     │                │                    │              ┌──────────┐
     └────────────────┴────────────────────┴─────────────►│ DECLINED │
                                                          └──────────┘
```

**Stage Definitions:**

1. **Triage**: Initial AI classification complete. Staff confirms urgency and document completeness.
2. **Incomplete**: Missing required information. System generates tasks to request missing items.
3. **Pending Review**: Complete referral awaiting physician review and routing decision.
4. **Routed**: Accepted and assigned to a provider/clinic. SLA tracking begins.
5. **Declined**: Referral rejected (duplicate, out of scope, etc.)

### Urgency Classification

| Level | SLA Target | Visual Indicator |
|-------|-----------|------------------|
| **Urgent** | 24 hours | Red badge, top of queue |
| **Not Urgent** | 72 hours | Standard processing |
| **Unknown** | - | Requires manual triage |

When a referral is marked as **urgent**, Blair automatically:
- Creates a Zendesk ticket for tracking
- Sends a Slack notification to #urgent-faxes
- Updates sidebar badge counts
- Prioritizes in the worklist

---

## Page-by-Page Functionality

### 1. Dashboard (`/dashboard`)

**Purpose**: Executive overview of system health and daily metrics.

**Layout**:
- **Top Stats Row**: Four KPI cards showing:
  - New faxes today (with hourly trend)
  - Referrals processed (completion percentage)
  - Average processing time (with trend indicator)
  - Pending items requiring attention

- **Processing Volume Chart**: 7-day bar chart showing daily fax volume with breakdown by status (processed vs. pending)

- **Referral Distribution**: Pie chart showing referrals by type (cardiology, imaging, lab, etc.)

- **Recent Activity Feed**: Real-time log of system events (new faxes, completed reviews, auto-filed documents)

**UX Rationale**: Provides at-a-glance situational awareness. Staff can immediately identify backlogs or unusual volume spikes.

---

### 2. Fax Inbox (`/faxes`)

**Purpose**: Central hub for all incoming faxes requiring human attention.

**Layout**:
- **Filter Tabs**: All | Unassigned | Assigned | Referrals | Non-Referral | Junk
- **Search Bar**: Full-text search across fax metadata
- **Fax Card Grid**: Each fax displays:
  - Thumbnail preview
  - Sender information (fax number, clinic name)
  - Received timestamp
  - AI classification with confidence score
  - Page count
  - Assignment status

**Batch Actions**:
- Multi-select faxes for bulk assignment
- Mark multiple as junk
- Bulk reassign to different staff

**UX Rationale**: Mimics email inbox patterns familiar to administrative staff. Confidence scores help prioritize which documents need careful review.

---

### 3. Fax Detail View (`/faxes/[id]`)

**Purpose**: Full document review with AI extraction panel.

**Layout** (Two-Column):

**Left Panel - Document Viewer**:
- PDF viewer with zoom/pan controls
- Page navigation
- Print/download options
- Highlight regions where AI extracted data

**Right Panel - Review Actions**:
- **Document Type Selector**: Dropdown to confirm/change AI classification
- **Patient Assignment**:
  - Shows AI-suggested patient match (if found)
  - Confidence indicator for match
  - "Search EMR" button if no match
  - "Create New Patient" option if patient doesn't exist
- **Extracted Fields**:
  - Patient name, DOB, OHIP number
  - Referring physician
  - Reason for referral
  - Editable fields to correct AI errors
- **Action Buttons**:
  - "Create Referral" - Starts referral workflow
  - "File to Patient" - Direct EMR filing
  - "Mark as Junk" - Spam classification
  - "Split Document" - For multi-patient faxes

**UX Rationale**: Side-by-side layout allows staff to verify AI extractions against the actual document without switching contexts.

---

### 4. Document Splitting (`/faxes/[id]/split`)

**Purpose**: Handle faxes containing multiple patient documents.

**Scenario**: A single fax contains a 10-page document with:
- Pages 1-3: Referral for Patient A
- Pages 4-7: Lab results for Patient B
- Pages 8-10: Imaging report for Patient C

**Layout**:
- **Page Thumbnails**: Draggable page previews
- **Document Groups**: Drop zones for creating separate documents
- **Group Properties**: Each group gets its own:
  - Document type classification
  - Patient assignment
  - Notes

**Process**:
1. Staff views full fax and identifies page breaks
2. Drags pages into logical groups
3. Assigns document type and patient to each group
4. Confirms split - creates multiple fax records from single original

**UX Rationale**: Healthcare faxes commonly bundle multiple documents. Without splitting, staff would need to manually re-fax or photocopy sections.

---

### 5. Referral Detail (`/referrals/[id]`)

**Purpose**: Complete referral management with all clinical context.

**Layout**:

**Header Bar**:
- Patient name and demographics
- Referral status badge
- SLA countdown timer (for urgent cases)
- Quick action buttons

**Three-Column Layout**:

**Column 1 - Referral Information**:
- Source fax link
- Referring physician details
- Reason for referral
- Clinical notes
- Attached documents

**Column 2 - Patient Context**:
- EMR patient record (if linked)
- Previous referral history
- Current medications
- Relevant diagnoses
- Insurance information

**Column 3 - Actions & Tasks**:
- **Urgency Confirmation**: Dropdown to set urgent/not-urgent + confirm button
- **Completeness Checklist**: Visual checklist showing:
  - Required: OHIP, DOB, Diagnosis (green check or red X)
  - Optional: Insurance, PCP contact
- **Missing Items**: Action buttons to request missing info
- **Routing Panel**: Provider assignment dropdown
- **Timeline**: Audit log of all actions taken

**Urgency Confirmation Flow**:
When staff confirms a referral as **urgent**:
1. Zendesk ticket auto-created
2. Slack notification sent to #urgent-faxes
3. Pop-up dialogs confirm each integration action
4. Sidebar badges update in real-time

**UX Rationale**: Centralizes all information needed for routing decisions. Staff shouldn't need to open multiple systems to process a referral.

---

### 6. Referral Inbox (`/referrals`)

**Purpose**: Worklist of all referrals requiring action.

**Layout**:
- **Status Tabs**: All | Triage | Incomplete | Pending Review | Routed | Declined
- **Priority Indicators**: Visual flags for urgent cases
- **SLA Status**: Color-coded countdown (green → yellow → red)
- **Bulk Actions**: Multi-select for batch status changes

**Sorting Options**:
- By urgency (urgent first)
- By SLA deadline
- By received date
- By referring physician

**UX Rationale**: Priority-focused view ensures urgent cases are never buried under routine referrals.

---

### 7. Worklist (`/worklist`)

**Purpose**: Personal task queue for logged-in staff member.

**Layout**:
- **My Tasks**: Items assigned to current user
- **Priority Queue**: AI-ranked by urgency and SLA
- **Filters**: By type (fax, referral, follow-up), by status
- **Time Estimates**: AI-predicted time to complete each task

**Task Types**:
- Review fax document
- Complete referral triage
- Request missing information
- Make routing decision
- Follow up on pending items

**UX Rationale**: Reduces cognitive load by presenting a prioritized, personal view of what needs attention.

---

### 8. Communications (`/communications`)

**Purpose**: Outbound communication tracking and management.

**Sections**:

**Outreach Log**:
- History of all patient/provider communications
- Status tracking (sent, delivered, opened, responded)
- Templates used
- Response content

**Communication Templates**:
- Pre-built templates for common scenarios:
  - Missing information requests
  - Appointment confirmations
  - Follow-up reminders
- Variable substitution (patient name, dates, etc.)

**Pending Responses**:
- Items awaiting reply
- Days since last contact
- Escalation indicators

**UX Rationale**: Centralizes communication history that would otherwise be scattered across email, phone logs, and fax records.

---

### 9. Integration Feeds

#### Zendesk Feed (`/integrations/zendesk`)

**Purpose**: Unified view of support tickets related to referral processing.

**Layout**:
- **Stats Cards**: Open tickets, urgent count, needs response, avg response time
- **Filter Tabs**: All | Auto-Created | Manual | Resolved
- **Ticket Cards**: Each showing:
  - Ticket number and subject
  - Priority badge (urgent/high/normal/low)
  - Status indicator
  - Linked referral/fax (clickable)
  - Created timestamp
  - Assignee

**Auto-Creation Rules**:
- Urgent referral triaged → Creates urgent priority ticket
- SLA breach warning → Creates high priority ticket
- Document processing error → Creates normal priority ticket

**Dynamic Updates**: When urgent referrals are confirmed, new tickets appear immediately in this feed.

**UX Rationale**: Keeps ticketing visible within Blair rather than requiring context-switching to Zendesk portal.

---

#### Slack Feed (`/integrations/slack`)

**Purpose**: Log of all Slack notifications sent by Blair.

**Layout**:
- **Stats Cards**: Notifications today, unhandled alerts, failed sends, reports this week
- **Filter Tabs**: All Activity | Alerts | Digests
- **Grouped by Date**: Today, Yesterday, This Week, Older
- **Activity Cards**: Each showing:
  - Channel name (#urgent-faxes, #daily-digest, etc.)
  - Message preview
  - Linked items (referral, fax)
  - Sent timestamp
  - Delivery status

**Alert Types**:
- Urgent referral notifications
- SLA warning alerts
- SLA breach alerts
- Daily digest summaries
- Weekly reports

**UX Rationale**: Provides visibility into what team members are seeing in Slack, helps debug notification issues.

---

#### Salesforce Feed (`/integrations/salesforce`)

**Purpose**: Sync status with Salesforce CRM records.

**Layout**:
- **Sync Status**: Last sync time, records synced today
- **Record Types**: Contacts, Opportunities, Activities
- **Sync Log**: History of sync operations with success/failure status

**UX Rationale**: For clinics using Salesforce for patient relationship management, provides visibility into data synchronization.

---

#### Cerebrum EMR (`/integrations/cerebrum`)

**Purpose**: Monitor EMR integration health.

**Layout**:
- **Connection Status**: Real-time API health indicator
- **Sync Metrics**: Patients synced, documents filed, errors
- **Patient Match Log**: History of AI patient matching attempts
- **Error Queue**: Failed operations requiring manual intervention

**UX Rationale**: EMR integration is critical path - any issues need immediate visibility.

---

### 10. Settings Pages

#### Auto-Filing Rules (`/settings/document-types`)

**Purpose**: Configure AI automation thresholds.

**Layout**:
- **Global Controls**:
  - Master auto-file toggle (on/off)
  - Shadow mode toggle (log only, don't act)
  - Global confidence threshold slider (50-99%)

- **Document Types Table**:
  | Document Type | Category | Auto-File | Threshold |
  |--------------|----------|-----------|-----------|
  | Referral | Clinical | Toggle | Input (%) |
  | Lab Report | Clinical | Toggle | Input (%) |
  | Imaging | Diagnostic | Toggle | Input (%) |
  | ... | ... | ... | ... |

- **Per-Type Threshold Editing**: Inline number input with confirm button
- **Global Threshold Propagation**: Changing global threshold updates all individual thresholds

- **Performance Stats**: 7-day metrics showing auto-file accuracy

**UX Rationale**: Different document types warrant different confidence levels. Lab results may need higher confidence than generic correspondence.

---

#### Workflows (`/settings/workflows`)

**Purpose**: Configure referral pipeline stages and transitions.

**Layout**:
- **Stage Configuration**: Define which stages exist
- **Transition Rules**: Which stages can flow to which
- **Required Fields**: What must be complete before advancing
- **SLA Definitions**: Time targets per stage

---

#### Team (`/settings/team`)

**Purpose**: User management and permissions.

**Layout**:
- **User List**: Name, role, status, last active
- **Invite Users**: Email invitation form
- **Roles**: Admin, Staff, Reviewer, Read-Only
- **Activity Log**: User action history

---

## Edge Cases & Error Handling

### 1. Patient Not Found in EMR

**Scenario**: AI extracts patient demographics but cannot find matching EMR record.

**Handling**:
- Yellow warning banner: "No EMR match found"
- Displays extracted info (name, DOB, OHIP) for verification
- Three options presented:
  1. **Search EMR**: Opens advanced search modal with extracted values pre-filled
  2. **Create New Patient**: Opens new patient form in Cerebrum (if integration allows)
  3. **File Without Match**: Creates orphan record that can be matched later

**Visual Indicators**:
- Patient card shows "Unmatched" badge
- Search results show confidence scores for near-matches
- Previous patient history appears empty

---

### 2. Document Splitting Required

**Scenario**: Single fax contains multiple patient documents.

**Handling**:
- AI detection: System flags when page content suggests multiple patients
- Manual trigger: Staff can initiate split from fax detail view
- Split interface (see Section 4 above)
- After split: Each resulting document processed independently

**Edge Cases Within Splitting**:
- Single-page fax: Split option disabled
- All pages same patient: Warning shown, allow override
- Ambiguous pages: Can be assigned to multiple groups

---

### 3. OHIP Number Not Found

**Scenario**: Referral document doesn't contain OHIP health card number.

**Handling**:
- Completeness check shows red X for "OHIP Number"
- Status set to "Incomplete"
- Auto-generated task: "Request OHIP from referring clinic"
- Communication template pre-populated with request
- Referral blocked from "Routed" status until resolved

**Resolution Paths**:
- Staff manually enters OHIP after phone call
- Fax reply received → staff attaches and extracts
- Mark as "Exempt" with reason (e.g., newborn, refugee)

---

### 4. Date of Birth Not Found

**Scenario**: DOB missing from referral document.

**Handling**:
- Similar to OHIP: blocks completion
- If OHIP present: May attempt EMR lookup to fill DOB
- Task generated for follow-up
- Age-sensitive routing rules cannot apply until resolved

---

### 5. Referring Physician Not in Directory

**Scenario**: Referring physician name/fax extracted but not in provider directory.

**Handling**:
- Yellow warning: "Unknown referring physician"
- Shows extracted values (name, fax, phone)
- Options:
  1. **Search Directory**: Find existing match with different spelling
  2. **Add New Provider**: Create directory entry
  3. **Proceed Without**: Link to fax number only

---

### 6. Duplicate Referral Detection

**Scenario**: Same patient appears to have been referred multiple times.

**Handling**:
- AI flags potential duplicates based on:
  - Same patient + similar timeframe
  - Same referring physician
  - Similar reason for referral
- Warning shown with link to existing referral
- Options: Merge, Mark as Duplicate, Proceed as New

---

### 7. SLA Breach Approaching

**Scenario**: Urgent referral nearing 24-hour deadline.

**Handling**:
- 4 hours before: Yellow warning in worklist
- 1 hour before: Slack notification to #urgent-faxes
- At breach: Red status, Zendesk ticket escalated, manager notified
- Post-breach: Tracking continues for reporting

---

### 8. EMR Connection Failure

**Scenario**: Cerebrum API unavailable.

**Handling**:
- Banner notification: "EMR connection lost"
- Auto-file operations queued (not lost)
- Patient searches fall back to cached data
- Retry mechanism with exponential backoff
- Manual retry button available
- Dashboard shows connection status

---

### 9. Fax Quality Issues

**Scenario**: Poor quality fax scan affects AI extraction.

**Handling**:
- Low confidence scores on all fields
- "Low Quality" badge on fax
- Manual review required for all extractions
- Option to request re-fax from sender

---

### 10. Multi-Language Documents

**Scenario**: Document contains non-English text.

**Handling**:
- Language detection in AI pipeline
- Flagged for specialized review if non-English
- Translation notes field available
- Does not attempt extraction from non-English portions

---

## State Management

Blair uses **Zustand** for lightweight, performant state management:

### Integration Store (`/stores/use-integration-store.ts`)

Manages dynamically added Zendesk tickets and Slack activities:

```typescript
interface IntegrationStore {
  addedZendeskTickets: ZendeskTicket[];
  addedSlackActivities: SlackActivity[];
  addZendeskTicket: (ticket: ZendeskTicket) => void;
  addSlackActivity: (activity: SlackActivity) => void;
  getNewZendeskCount: () => number;
  getNewSlackCount: () => number;
}
```

**Key Behaviors**:
- New items prepended to arrays (newest first)
- Badge counts computed from open/pending items
- Persists for session duration
- Sidebar subscribes for real-time badge updates

---

## Data Models

### Fax Document

```typescript
interface FaxDocument {
  id: string;
  faxNumber: string;
  senderName?: string;
  receivedAt: string;
  pageCount: number;
  status: 'unassigned' | 'assigned' | 'processed' | 'junk';
  documentType?: DocumentType;
  confidence: number;
  assignedTo?: string;
  patientMatch?: PatientMatch;
}
```

### Referral

```typescript
interface Referral {
  id: string;
  faxId: string;
  patientId?: string;
  patientName: string;
  dateOfBirth?: string;
  ohipNumber?: string;
  status: 'triage' | 'incomplete' | 'pending-review' | 'routed' | 'declined';
  urgency: 'unknown' | 'urgent' | 'not-urgent';
  referringPhysician: PhysicianInfo;
  reasonForReferral: string;
  missingItems: MissingItem[];
  assignedProvider?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Zendesk Ticket

```typescript
interface ZendeskTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  source: 'auto-created' | 'manual';
  linkedEntityType?: 'referral' | 'fax';
  linkedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Slack Activity

```typescript
interface SlackActivity {
  id: string;
  type: 'urgent-alert' | 'sla-warning' | 'sla-breach' | 'daily-digest' | 'weekly-report';
  channel: string;
  message: string;
  status: 'sent' | 'failed';
  linkedItems?: LinkedItem[];
  hasQuickActions: boolean;
  handled: boolean;
  postedAt: string;
}
```

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects Next.js configuration
4. Deploy

### Environment Variables

```env
# EMR Integration
CEREBRUM_API_URL=https://api.cerebrum.example.com
CEREBRUM_API_KEY=your-api-key

# Zendesk Integration
ZENDESK_SUBDOMAIN=heartland-cardiology
ZENDESK_API_TOKEN=your-token

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SLACK_BOT_TOKEN=xoxb-...

# Salesforce Integration
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...
```

---

## License

Proprietary - Heartland Cardiology / Blair Health Tech

---

## Support

For technical support or feature requests, contact the development team or create an issue in the repository.
