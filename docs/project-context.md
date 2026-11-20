# Temple Management System — Complete Context & Architecture

This document provides the complete end-to-end context of the Temple Management Platform (Version 1.0), covering system architecture, domain ownership, the Admin Dashboard, the Member Application, and core governance rules.

---

## 1. Project Overview & Scope

The platform provides a digital platform for Hindu temple operations and devotee services:
1. **Member Portal (`apps/client` on Port 3000 & `apps/client-server` on Port 5001)** — Member onboarding, Darshan feed, daily poojas, event discovery, UPI Kanikai submission, and personal contribution history.
2. **Admin Dashboard (`apps/admin` on Port 3001 & `apps/admin-server` on Port 5002)** — Event lifecycle management, payment proof auditing, offline contribution recording, financial reporting, Darshan configuration, announcements, and fraud oversight.

---

## 2. Shared Monorepo Packages (`packages/*`)

All business invariants, validation schemas, and database definitions are centralized to avoid logic divergence:
- **`@temple/contracts`**: Single source of truth for domain enums (`PaymentStatus`, `PaymentMode`, `EventStatus`, `TargetAudience`, `ErrorCode`) and API response envelope functions.
- **`@temple/shared`**: Centralized request validators (`validateRegistration`, `validateEvent`, `validateContributionSubmission`, `validateOfflineContribution`, `validateNotification`) and domain logic services (`FraudService`).
- **`@temple/database`**: Shared Mongoose schemas, connections, and indexes (`Admin`, `Member`, `Event`, `Contribution`, `FraudRecord`, `Notification`, `NotificationRead`, `DarshanSettings`).

---

## 3. The 8 Core Business Invariants (SRS Section 12)

1. **Financial history must never be lost** because of event edits, event cancellations, or member account changes.
2. **Members can only access their own financial records.**
3. **Admin has complete visibility** into all financial records and audit logs.
4. **Contribution amounts are not enforced** by the application (customary devotee offerings).
5. **Admin manually verifies** member-submitted UPI payment proof screenshots.
6. **Event cancellation does not erase payment history.** Contributions remain labeled as belonging to a cancelled event. The event appears in member feeds for 24 hours with a `Cancelled` badge. **No refunds are provided.**
7. **Member account deletion must preserve historical financial records.** Sets `isActive = false` (soft delete).
8. **V1 remains simple and avoids unnecessary automation** (no automated payment gateways, SMS OTP, or refund processing).

---

## 4. Fraud Management & Strike Policy (SRS Section 7)

- **Penalty Evaluation:** When a payment proof is flagged as fraudulent by admin, `FraudService.applyFraudStrike(member)` logs a confirmed fake attempt.
- **Red Border Threshold:** When a member exceeds **5 confirmed fake attempts**, their profile automatically receives a **Red Border**.
- **Public Visibility:** The red border is publicly visible to everyone on the platform.
- **Confidential Logs:** Detailed fraud reasons and audit records are visible only to admins.
- **Manual Removal:** Admin can manually clear the red-border status, but historical fraud logs remain permanently preserved in `fraud_records`.

---

## 5. Admin Dashboard Feature Breakdown

- **Overview (`/`):** Total Registered Members, Total Collections Collected (₹), Pending Verifications Count, and Upcoming Events Count.
- **Events (`/events`):** Upcoming, Past, Cancelled filters; multi-image event creator with temple default image fallback; event editor; cancellation modal enforcing no-refunds and 24h feed visibility.
- **Payments (`/payments`):** Pending verification queue with zoomable screenshot viewer; 1-click Approve, Reject (with required reason), and Flag Fraud; Offline Contribution entry for Cash, UPI, and Bank Transfers with admin attribution.
- **Reports (`/reports`):** Event-wise collection summaries, individual contributor tables, and one-click export to CSV and Excel (.xls).
- **Members (`/members`):** Directory showing join date, total contributions, soft-delete status, and strike counter; prominent red border badge; fraud history modal; manual red-border toggle.
- **Darshan (`/darshan`):** Daily Karyakrams scheduler (add/edit/delete ritual slots), pooja timings, and temple operational hours.
- **Notifications (`/notifications`):** Full CRUD for announcements with target audience segmentation (`ALL`, `PAID`, `UNPAID`, `INDIVIDUAL`) and expiry timestamps.
- **Authentication (`/login`):** Single admin account (`admin@temple.org` / `admin123`) with email-based password reset.

---

## 6. Member Portal Integration (For Client Team)

- Member portal submits UPI screenshot to `POST /api/v1/contributions` with `{ eventId, amount, paymentProofUrl }`.
- Status starts as `PENDING`, which immediately displays in the admin dashboard's pending queue.
- When admin approves, status becomes `PAID`.
- Client profile checks `member.hasRedBorder` to render the red border styling if the devotee has been flagged for fraud.
- Client Darshan feed reads `DarshanSettings.findOne()` to display real-time pooja schedules and announcements.

