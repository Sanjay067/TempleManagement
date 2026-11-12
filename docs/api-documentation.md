# API Documentation & Contract Specification
## Temple Management System — Member API (`client-server`) & Admin API (`admin-server`)

All endpoints use standard JSON request/response envelopes defined in `@temple/contracts`.  
Authenticated requests must supply `Authorization: Bearer <jwt_token>` in the HTTP headers.

---

## 1. Standard Response Envelope

### Success Format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Format:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": []
  }
}
```

---

## 2. Member Server API (`apps/client-server` — Default Port 5001)

### 2.1 Authentication & Registration (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Register a new temple member. Sends verification email with single-use token.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Arun Kumar",
    "email": "arun@example.com",
    "mobileNumber": "9876543210",
    "address": "12 Temple Street, Madurai",
    "password": "SecurePassword123!",
    "profilePhotoUrl": "https://..." // Optional
  }
  ```
- **Validation:** Unique mobile and email among active accounts; password min 8 characters.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "message": "Registration successful. Please check your email to verify your account."
    }
  }
  ```

#### `POST /api/v1/auth/verify-email`
Verifies account using the token sent via email.
- **Access:** Public
- **Request Body:** `{ "token": "uuid-or-crypto-token" }`
- **Response (200 OK):** `{ "success": true, "message": "Email verified successfully." }`

#### `POST /api/v1/auth/login`
Authenticates an active, email-verified member.
- **Access:** Public
- **Request Body:** `{ "email": "arun@example.com", "password": "SecurePassword123!" }`
- **Response (200 OK):** Returns member JWT and profile summary (including `hasRedBorder`).

#### `POST /api/v1/auth/forgot-password`
Sends password reset email link with secure token.
- **Access:** Public
- **Request Body:** `{ "email": "arun@example.com" }`

#### `POST /api/v1/auth/reset-password`
Resets password using verification token.
- **Access:** Public
- **Request Body:** `{ "token": "reset-token", "newPassword": "NewSecurePassword123!" }`

---

### 2.2 Member Profile & Account (`/api/v1/members`)

#### `GET /api/v1/members/me`
Fetches current authenticated member profile.
- **Access:** Authenticated Member

#### `PUT /api/v1/members/me`
Updates profile details.
- **Access:** Authenticated Member
- **Allowed Fields:** `name`, `mobileNumber`, `address`, `profilePhotoUrl`.
- **Note:** `email` is strictly immutable.

#### `DELETE /api/v1/members/me`
Executes account self-deletion (Soft Delete: `isActive = false`).
- **Access:** Authenticated Member
- **Response (200 OK):** Deactivates account, invalidates current session. Historical contribution records remain intact.

---

### 2.3 Darshan Feed (`/api/v1/darshan`)

#### `GET /api/v1/darshan/feed`
Aggregates the landing page feed for members:
1. **Upcoming Event:** The single nearest active upcoming event.
2. **Important Notifications:** Active admin notifications + cancelled events within the last 24 hours.
3. **Daily Karyakrams:** Daily pooja schedules, timings, and temple opening/closing hours.
- **Access:** Authenticated Member

---

### 2.4 Events & Gallery (`/api/v1/events` & `/api/v1/gallery`)

#### `GET /api/v1/events`
Lists temple events.
- **Query Params:** `type=upcoming|past`
- **Access:** Public & Member

#### `GET /api/v1/events/:id`
Retrieves single event details, including event images and contribution requirement status.
- **Access:** Public & Member

#### `GET /api/v1/gallery`
Lists all event photo albums.
- **Access:** Public & Member

---

### 2.5 Kanikai / Contributions (`/api/v1/contributions`)

#### `POST /api/v1/contributions`
Submits member UPI payment proof for admin verification.
- **Access:** Authenticated Member
- **Request Body (Multipart or JSON with uploaded screenshot URL):**
  ```json
  {
    "eventId": "event_id_here",
    "amount": 501,
    "paymentProofUrl": "https://storage.temple.org/proofs/rec_123.jpg"
  }
  ```
- **Behavior:** Creates contribution with status `PENDING`. Member cannot edit or delete this submission once created.

#### `GET /api/v1/contributions/my-history`
Fetches the member's personal contribution history.
- **Access:** Authenticated Member
- **Response Data:**
  ```json
  [
    {
      "id": "contr_123",
      "eventName": "Maha Shivaratri 2026",
      "amount": 501,
      "status": "PENDING",
      "paymentMode": "UPI",
      "isEventCancelled": false,
      "createdAt": "2026-11-12T10:00:00Z"
    }
  ]
  ```

---

### 2.6 Notifications (`/api/v1/notifications`)

#### `GET /api/v1/notifications`
Retrieves all non-expired notifications applicable to the logged-in member (`ALL`, `PAID`, `UNPAID`, or `INDIVIDUAL`).
- **Access:** Authenticated Member
- **Side Effect:** Automatically inserts/updates records in `notification_reads` so the notifications become marked as read.

---

## 3. Admin Server API (`apps/admin-server` — Default Port 5002)

### 3.1 Admin Authentication (`/api/v1/admin/auth`)

#### `POST /api/v1/admin/auth/login`
Authenticates the single administrator.
- **Access:** Public
- **Request Body:** `{ "email": "admin@temple.org", "password": "AdminPassword123!" }`
- **Response:** Admin JWT token signed with `ADMIN_JWT_SECRET`.

#### `POST /api/v1/admin/auth/forgot-password` & `POST /api/v1/admin/auth/reset-password`
Email-based password reset for the admin account.

---

### 3.2 Dashboard Overview (`/api/v1/admin/dashboard`)

#### `GET /api/v1/admin/dashboard/stats`
Returns top-level metric counters:
- `totalRegisteredMembers`: Active count of members
- `totalContributionsCollected`: Sum of all `PAID` contributions in INR
- `pendingVerificationsCount`: Count of contributions with status `PENDING`
- `upcomingEventsCount`: Count of events with status `UPCOMING`

---

### 3.3 Event Management (`/api/v1/admin/events`)

#### `POST /api/v1/admin/events`
Creates a new event.
- **Request Body:**
  ```json
  {
    "title": "Navaratri Celebrations 2026",
    "description": "9 days special pooja and cultural programs",
    "eventDateTime": "2026-10-15T09:00:00Z",
    "expiryTime": "2026-10-24T22:00:00Z",
    "images": ["url1", "url2"],
    "isContributionRequired": true
  }
  ```

#### `PUT /api/v1/admin/events/:id`
Edits existing event details. Existing financial and audit records are never affected.

#### `PATCH /api/v1/admin/events/:id/cancel`
Cancels the event. Sets `status = 'CANCELLED'` and `cancelledAt = new Date()`.
- Contributions remain intact and labeled as belonging to a cancelled event.
- Event is shown in member Darshan feed for 24 hours with `Cancelled` badge.

---

### 3.4 Payment Verification & Management (`/api/v1/admin/contributions`)

#### `GET /api/v1/admin/contributions`
Lists contributions with filtering by `status` (`PENDING`, `PAID`, `REJECTED`), `eventId`, or date range. Includes member details and payment proof image link.

#### `PATCH /api/v1/admin/contributions/:id/verify`
Approves or rejects a pending submission.
- **Request Body:**
  ```json
  {
    "action": "APPROVE" // or "REJECT",
    "rejectionReason": "Screenshot blurred" // Required if REJECT
  }
  ```
- **Result:** Status moves to `PAID` or `REJECTED`.

#### `POST /api/v1/admin/contributions/:id/flag-fraud`
Marks payment proof as fraudulent.
- **Request Body:** `{ "reason": "Altered or forged UPI screenshot" }`
- **Result:**
  - Sets `isFraudulent = true`, status = `REJECTED`.
  - Increments `member.fakePaymentCount`.
  - If `fakePaymentCount > 5`, automatically sets `member.hasRedBorder = true`.
  - Creates an entry in `fraud_records`.

#### `POST /api/v1/admin/contributions/offline`
Records offline contribution received outside the app.
- **Request Body:**
  ```json
  {
    "memberId": "member_id",
    "eventId": "event_id",
    "amount": 1000,
    "paymentMode": "CASH", // "CASH" | "UPI" | "BANK_TRANSFER"
    "status": "PAID" // "PAID" | "NOT_PAID"
  }
  ```
- **Audit:** Automatically captures `recordedByAdminId` and timestamp.

#### `GET /api/v1/admin/contributions/reports`
Event-wise summary showing:
- Event title
- Number of contributors
- Total collected amount
- List of individual contributions

#### `GET /api/v1/admin/contributions/reports/export?eventId=...&format=csv|xlsx`
Streams formatted CSV or Excel file for financial audits.

---

### 3.5 Member & Fraud Management (`/api/v1/admin/members`)

#### `GET /api/v1/admin/members`
Lists members with their contact details, contribution counts, `fakePaymentCount`, and `hasRedBorder` flag.

#### `GET /api/v1/admin/members/:id/fraud-history`
Fetches complete list of fraudulent submissions and administrative audit notes for the specified member.

#### `PATCH /api/v1/admin/members/:id/red-border`
Allows admin to manually clear the red-border status.
- **Request Body:** `{ "hasRedBorder": false }`
- **Audit:** Historical fraud records remain permanently saved.

---

### 3.6 Notifications Management (`/api/v1/admin/notifications`)

#### `POST /api/v1/admin/notifications`
Creates announcement, stores it in DB, and dispatches email to target audience.
- **Request Body:**
  ```json
  {
    "title": "Special Annadhanam Notice",
    "message": "Annadhanam will be served on Sunday afternoon...",
    "targetAudience": "ALL", // "ALL" | "PAID" | "UNPAID" | "INDIVIDUAL"
    "targetMemberIds": [],
    "expiryDate": "2026-11-20T23:59:59Z"
  }
  ```

#### `GET /api/v1/admin/notifications` & `PUT /api/v1/admin/notifications/:id` & `DELETE /api/v1/admin/notifications/:id`
Full CRUD for active notifications.

---

### 3.7 Darshan Settings (`/api/v1/admin/darshan-settings`)

#### `GET /api/v1/admin/darshan-settings`
Fetches current daily karyakrams, pooja timings, and temple hours.

#### `PUT /api/v1/admin/darshan-settings`
Updates daily temple schedule and operational hours.
