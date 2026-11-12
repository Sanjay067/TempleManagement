# Software Requirements Specification (SRS)
## Temple Management Website — Version 1.0 (V1 Scope)
**Document Version:** 1.0  
**Date:** 12 November 2026  
**Scope:** Member Application and Admin Dashboard  
**Excluded:** Social networking, payment gateway integration, refund processing, mobile OTP  

---

## 1. Project Overview
The platform provides a digital service for temple members to:
- View temple events, activities, and photo galleries.
- Access daily pooja schedules and temple timings (Darshan feed).
- View important announcements and administrative notifications.
- Submit contribution (Kanikai) payment proofs via UPI QR code.
- Track their personal contribution history.

The application has two separate interfaces and servers:
1. **Member Application (`apps/client` & `apps/client-server`)**
2. **Admin Dashboard (`apps/admin` & `apps/admin-server`)**

V1 focuses strictly on essential temple operations rather than social networking features.

---

## 2. Member Management

### 2.1 Registration
Members must provide:
- **Name** (Mandatory)
- **Mobile Number** (Mandatory)
- **Email Address** (Mandatory)
- **Address** (Mandatory)
- **Profile Photo** (Optional)
- **Password** (Mandatory, securely hashed)

**Business Rules:**
- **Email Verification:** Mandatory before accessing authenticated member features.
- **Mobile OTP:** Not required in V1.
- **Mobile Uniqueness:** Mobile numbers must be unique among *active* accounts.
- **Email Immutability:** Email addresses cannot be changed after registration.
- **Profile Updates:** Members can update their Name, Mobile Number, Address, and Profile Photo.
- **Password Recovery:** Handled via email password reset link with time-limited tokens.

### 2.2 Account Deletion
- Members can delete their own accounts at any time from their profile.
- Account deletion executes a soft delete by setting `isActive = false`.
- The account becomes completely inaccessible for login.
- **Financial History Preservation:** Historical contribution and payment audit records remain permanently intact.
- **No Admin Intervention:** Deletion does not require admin approval.
- **Re-registration:** Deleted members who wish to use the application must register anew.
- **Identifier Reuse:** Previously used mobile numbers and email addresses can be reused once the prior account is deactivated.
- **Account Isolation:** A new registration creates a separate member account ID; old financial records remain associated exclusively with the previous deactivated account ID.

### 2.3 Member Privacy
- Member profiles are strictly private.
- Members cannot browse, view, or search other members' profiles or personal details.
- Admin can access all member details.
- **Public Red-Border Exception:** If a member receives a "red-border" fraud flag (exceeding 5 confirmed fake payment attempts), this red border is publicly visible to everyone on the platform.

---

## 3. Event Management

### 3.1 Event Creation
Admin can create events with:
- Event title
- Description
- Event date and time
- Expiry date and time
- Multiple images (If no images are uploaded, system displays default temple images)
- Contribution flag: Events can be created with or without contribution requirements.

### 3.2 Event Editing
- Admin can edit published events (title, description, date, time, expiry, images).
- **Audit Invariant:** Existing payment audit records must NEVER be modified, corrupted, or deleted through event editing.
- Contribution-related historical records must remain intact.

### 3.3 Event Cancellation
- Admin can cancel an event at any time, even if members have already contributed.
- **On Cancellation:**
  - Payment audit records remain intact.
  - Member contribution history retains the contribution, labeled as belonging to a **Cancelled Event**.
  - The cancelled event appears in the member's Darshan Feed with a **Cancelled** badge/label.
  - The cancelled event disappears from the member-facing feed after **24 hours**.
  - Historical event and payment records remain preserved in the database and admin views.
  - **No refunds are provided.**

### 3.4 Event Expiry
- Upcoming events automatically transition to **Past Events** once their configured expiry time passes.
- Past events remain accessible through the Gallery.
- Expiry does not delete event information or financial records.

---

## 4. Gallery
- Gallery is **entirely event-based** in V1.
- Each event can contain multiple photos.
- Members can open any event to view all associated images.
- Past events are archived and accessible through the Gallery.
- Standalone gallery uploads (photos outside events) are not supported in V1.

---

## 5. Darshan Feed
The Darshan Feed is the primary landing page for members. It contains three primary sections:

### 5.1 Upcoming Event
- Displays **only the single nearest upcoming event**.
- Shows event title, date, time, and relevant preview details.
- Members can tap/click to open full event details and view images or contribute.

### 5.2 Important Notifications
- Displays active announcements published by admin.
- Cancelled events appear here for 24 hours.
- Notifications are delivered through both the website and email.

### 5.3 Daily Karyakrams
Displays temple schedules and regular routines:
- Daily pooja schedules
- Pooja timings
- Temple opening hours
- Temple closing hours
- Other regular temple activities
- Admin manages these details directly via the Darshan Page Management section.

---

## 6. Kanikai / Contributions

### 6.1 Contribution Rules
- Members are familiar with customary contribution amounts; the application **will not prescribe or enforce a fixed contribution amount**.
- Members enter the customary amount they wish to pay.
- Admin verifies whether the submitted amount is appropriate.
- Members can contribute multiple times to the same event.
- Individual contribution records and amounts must be preserved independently.

### 6.2 Member Contribution Flow
1. Member opens an event.
2. Member accesses its contribution/payment section.
3. Member scans the temple's static UPI QR code and completes payment via their own UPI app.
4. Member uploads a payment screenshot (image proof).
5. Member clicks the **Paid** button.
6. A confirmation dialog asks whether the payment was successful.
7. If confirmed, the submission status transitions to **Pending**.
8. Member waits for admin verification.
- **Note:** Members cannot edit or withdraw a pending submission once submitted.

### 6.3 Payment Verification
Admin can:
- View all pending submissions.
- View member information.
- View payment screenshots.
- Approve or reject submissions.

**Payment Statuses:**
- `Not Paid`
- `Pending`
- `Paid`
- `Rejected`

**Status Transitions:**
- On approval: Submission transitions to `Paid`.
- On rejection: Submission transitions to `Rejected`. The member must revisit the event and repeat the submission process with new payment proof.
- **Important:** Payment approval and rejection do not automatically generate notifications in V1.

### 6.4 Offline Contributions
Admin can manually record contributions made outside the application (Cash, UPI, Direct Bank Transfer):
- Select member
- Enter contribution amount
- Select payment mode (`Cash`, `UPI`, `Direct Bank Transfer`)
- Set status to `Paid` or `Not Paid`
- **Audit Requirement:** The system must record which admin performed the action and the exact timestamp.

### 6.5 Member Contribution History
- Members can view **only their own** contribution history.
- Each record displays:
  - Event name
  - Contributed amount
  - Payment status
  - Cancelled Event badge (if the event was cancelled)
- Other members' contribution information is never exposed.

### 6.6 Payment Audit
- Admin has access to all contribution records across all members.
- Historical records must remain intact even when:
  - An event is edited
  - An event is cancelled
  - A member deletes their account
  - A member registers again
- Duplicate payment detection is handled manually by admin in V1.
- Payment proof requires only a screenshot (UTR / Reference number is not mandatory).

---

## 7. Fraud Management
- Admin can flag a payment submission as fraudulent.
- Confirmed fake payment attempts are permanently logged.
- **Threshold Rule:** When a member exceeds **five (5) confirmed fake payment attempts**, their profile automatically receives a **red border**.
- The red border is **publicly visible to everyone**.
- Detailed fraud logs/reasons are visible only to admins.
- Admin can manually remove the red-border status.
- Historical fraud records are never erased.

---

## 8. Notifications

### 8.1 Notification Creation
Admin can create notifications with:
- Title
- Message body
- Target audience
- Expiry date

### 8.2 Target Audience
Admin can target:
- `All members`
- `Paid members` (members with at least one approved contribution)
- `Unpaid members`
- `Selected individual members`

### 8.3 Notification Management
Admin has full CRUD functionality:
- Create notifications
- View notifications
- Update notifications
- Delete notifications
- Configure expiry

### 8.4 Notification Behavior
- Notifications appear inside the website member portal.
- **Multi-channel:** Every notification is also delivered through email.
- **Auto Read:** Notifications automatically become read when viewed in the web interface; members do not manually click "mark as read".
- Expired notifications disappear automatically from the member-facing feed.

---

## 9. Admin Dashboard

### 9.1 Dashboard Overview
The admin homepage displays:
- Total registered members
- Total contributions collected (INR)
- Pending payment verifications count
- Upcoming events list

### 9.2 Event Management
- Create, edit, cancel events.
- Upload multiple images per event.
- Manage event expiry timestamps.

### 9.3 Payment Management
- Review pending payments with screenshot viewer.
- Approve or reject submissions.
- Record offline contributions.
- Update offline payment status.
- View event-wise collections and individual records.

### 9.4 Collection Reports
For each event, displays:
- Event name
- Number of contributors
- Total amount collected
- Individual contribution records and payment statuses
- **Export:** Admin can export contribution records as Excel (.xlsx) or CSV files.

### 9.5 Member Management
- Access member details and manage fraud status (remove red border).
- Note: Advanced member search, filtering, and temporary deactivation are excluded from V1.

### 9.6 Darshan Page Management
Admin manages:
- Daily Karyakrams
- Pooja timings
- Temple opening and closing timings
- Daily temple information & announcements

### 9.7 Admin Account
- V1 supports **exactly one admin account**.
- Admin has full administrative permissions.
- Admin password recovery is email-based.

---

## 10. Authentication and Access Rules Matrix

| Feature | Public | Member | Admin |
| :--- | :---: | :---: | :---: |
| View Gallery | **Yes** | **Yes** | **Yes** |
| View Events | **Yes** | **Yes** | **Yes** |
| View Darshan Feed | **No** | **Yes** | **Yes** |
| View Notifications | **No** | **Yes** | **Yes** |
| Access Kanikai (Contribution Page) | **No** | **Yes** | **Yes** |
| Submit Contributions | **No** | **Yes** | **Yes** |
| View Own Contribution History | **No** | **Yes** | **Yes** |
| View All Contribution Records | **No** | **No** | **Yes** |
| Manage Events | **No** | **No** | **Yes** |
| Manage Notifications | **No** | **No** | **Yes** |
| Manage Darshan Details | **No** | **No** | **Yes** |
| View Member Profiles | **No** | **Own profile only** | **All profiles** |

*(Note: Public can view a member's red border if displayed publicly, but cannot view member profile details).*

---

## 11. Explicitly Excluded from V1
1. Member-created blogs and articles.
2. Social networking features (comments, likes, member-to-member messaging).
3. Public member profiles (other than red-border indicator).
4. Advanced member search and filtering.
5. Multiple admin accounts / RBAC.
6. Temporary member deactivation / reactivation.
7. Automated duplicate payment detection.
8. Mandatory UTR / reference number collection.
9. Automated payment gateway integration (Razorpay, Stripe, etc.).
10. Refund processing.
11. Mobile OTP verification.
12. Automatic payment approval / rejection notifications.

---

## 12. Core Business Principles (Precedence Rules)
1. **Financial history must never be lost** because of event or account changes.
2. **Members can only access their own financial records.**
3. **Admin has complete visibility into financial records.**
4. **Contribution amounts are not enforced by the application.**
5. **Admin manually verifies member-submitted payment proofs.**
6. **Event cancellation does not erase payment history.**
7. **Member account deletion must preserve historical financial records.**
8. **V1 should remain simple and avoid unnecessary automation.**
