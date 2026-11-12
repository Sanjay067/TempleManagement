# Architecture Governance & Shared Logic Specification
## Domain Boundaries, Shared Code Strategy & Engineering Standards

---

## 1. Monorepo Structure & Domain Ownership

The Temple Management Platform is structured as an integrated monorepo. The codebase is organized into distinct domain workspaces to enforce strict separation of concerns, clear boundaries, and clean maintainability:

| Domain | Workspaces | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Member Portal** | `apps/client`<br>`apps/client-server` | Member Web Application (React/PWA) and Member API Server (Express). Handles member onboarding, email verification, Darshan feed aggregation, event discovery, Kanikai UPI payment proof submissions, member contribution history, and auto-read notifications. |
| **Admin Portal** | `apps/admin`<br>`apps/admin-server` | Admin Operations Dashboard (React) and Admin API Server (Express). Handles event lifecycle management (creation, update, cancellation, expiry), payment verification workflows (approval/rejection), manual offline contribution recording, fraud detection & red-border controls, financial reporting (Excel/CSV export), notifications management, and Darshan page configuration. |
| **Shared Core Packages** | `packages/contracts`<br>`packages/shared`<br>`packages/database` | Monorepo shared libraries providing the single source of truth for API contracts, domain validation schemas, core business invariant services, and database models/connections. |

---

## 2. Core Architectural Principle: Eliminating Logic Duplication

Because the member API server (`client-server`) and the administrative API server (`admin-server`) operate against the same underlying database and core business entities (Members, Events, Contributions), **duplicating business logic across servers is strictly prohibited**.

If one service defines a payment status as `'PENDING'` while another expects `'Pending'`, data corruption and process failure occur. If validation rules for mobile numbers or contribution amounts diverge between the applications, the platform's integrity is compromised.

### The Single Source of Truth Model

```
   ❌ BAD PRACTICE: Duplicated Logic in Independent Servers
   ┌───────────────────────┐            ┌───────────────────────┐
   │  apps/client-server   │            │   apps/admin-server   │
   │  Hardcoded 'PENDING'  │            │  Hardcoded 'Pending'  │
   │  Local telephone regex│            │  Different regex      │
   └───────────────────────┘            └───────────────────────┘

   ✅ BEST PRACTICE: Centralized Domain Logic via Scoped Packages
   ┌─────────────────────────────────────────────────────────────┐
   │                    packages/contracts                       │
   │              PaymentStatus.PENDING = 'PENDING'              │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
     ┌─────────────────────────┐     ┌─────────────────────────┐
     │   apps/client-server    │     │    apps/admin-server    │
     │ import { PaymentStatus }│     │ import { PaymentStatus }│
     │ from '@temple/contracts'│     │ from '@temple/contracts'│
     └─────────────────────────┘     └─────────────────────────┘
```

---

## 3. The 5 Core Engineering Rules

### Rule 1: Zero Hardcoded String Literals for Domain Enums
- Hardcoded status strings such as `'PAID'`, `'PENDING'`, `'REJECTED'`, `'UPCOMING'`, or `'ALL'` are prohibited in controllers, models, and frontend components.
- **Always import standard enums from `@temple/contracts`**:
  ```javascript
  const { PaymentStatus, EventStatus, TargetAudience, PaymentMode } = require('@temple/contracts');
  ```

### Rule 2: Single Source of Truth for Data Validation
- All request payload validation is driven by shared validation schemas in `packages/shared/validators`.
- Member registration validator in `packages/shared/validators/member.validator.js`:
  - 10-digit mobile number rule (`MOBILE_REGEX`).
  - Mandatory email, address, and name requirements.
- Contribution submission validator in `packages/shared/validators/contribution.validator.js`:
  - Positive numeric amount.
  - Payment proof URL/screenshot presence.
- Both backend servers consume these unified validation functions:
  ```javascript
  const { validateRegistration } = require('@temple/shared');

  const { isValid, errors } = validateRegistration(req.body);
  if (!isValid) {
    return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'Validation failed', errors));
  }
  ```

### Rule 3: Domain Calculations Live in `packages/shared/services`
- **Fraud Handling & Red Border Rule (SRS Section 7):**
  - Fraud status transitions and penalty evaluations must never be coded directly in route controllers.
  - Admin flagging endpoints must call the centralized `FraudService`:
    ```javascript
    const { FraudService } = require('@temple/shared');

    // Automatically applies strikes and determines red-border threshold (> 5 strikes)
    const { fakePaymentCount, hasRedBorder } = FraudService.applyFraudStrike(member);
    ```
  - When `client-server` queries any member data, it reads the identical `hasRedBorder` property computed by the shared domain service.

### Rule 4: Route Controllers Must Be Thin Adapters
Controllers in both backend services must remain strictly responsible for HTTP transport:
1. Extract request parameters (`req.body`, `req.params`, `req.user`).
2. Execute validation using `@temple/shared`.
3. Delegate business execution to shared services or database models.
4. Return standardized response envelopes via `@temple/contracts`.
- Business algorithms, financial computations, and database transactions must not be written inline within route handlers.

### Rule 5: Non-Destructive Invariant Compliance (SRS Section 12)
All services and contributors must adhere to the platform's non-negotiable data retention invariants:
- **Zero Hard Deletions on Financial Records:** Invocations of `.deleteOne()`, `.findByIdAndDelete()`, or `DELETE FROM contributions` are strictly forbidden on financial entities.
- **Member Soft-Deletion:** Member account deletions must set `isActive = false` to disable authentication while preserving all historical contributions.
- **Event Cancellation Invariant:** Event cancellation sets `status = 'CANCELLED'` and records `cancelledAt = new Date()`. The client server serves the event for 24 hours with a `Cancelled` badge, while preserving all historical financial records permanently.

---

## 4. Package Hierarchy & Dependency Architecture

Shared packages are scoped under the `@temple/*` namespace using workspace package declarations:
- `@temple/contracts`: Enums, DTOs, Error Codes, and standard API envelope helpers (`successResponse`, `errorResponse`).
- `@temple/shared`: Domain validators, business services (`FraudService`), and system-wide constants.
- `@temple/database`: Connection pooling, Mongoose models (`Member`, `Admin`, `Event`, `Contribution`, `FraudRecord`, `Notification`, `NotificationRead`, `DarshanSettings`), and database indexes.

### Consuming Shared Packages:

In `apps/client-server/package.json` and `apps/admin-server/package.json`:
```json
{
  "dependencies": {
    "@temple/contracts": "*",
    "@temple/shared": "*",
    "@temple/database": "*"
  }
}
```

Import syntax within services:
```javascript
const { PaymentStatus, PaymentMode, ErrorCode, successResponse, errorResponse } = require('@temple/contracts');
const { FraudService, validateRegistration } = require('@temple/shared');
const { Member, Event, Contribution } = require('@temple/database');
```

---

## 5. Local Development Environment & Port Assignments

To facilitate local multi-service execution without port collisions:

| Application | Runtime / Framework | Local Port | Environment File |
| :--- | :--- | :--- | :--- |
| `apps/client` | React / Vite | `http://localhost:3000` | `apps/client/.env` |
| `apps/admin` | React / Vite | `http://localhost:3001` | `apps/admin/.env` |
| `apps/client-server` | Node.js / Express | `http://localhost:5001` | `apps/client-server/.env` |
| `apps/admin-server` | Node.js / Express | `http://localhost:5002` | `apps/admin-server/.env` |
| Database | MongoDB | `mongodb://localhost:27017/temple_management` | Standard local URI |

---

## 6. Engineering Standards & Contribution Workflow

### 6.1 Branching Strategy
- `main`: Production-ready releases.
- `develop`: Integration branch.
- Topic branches:
  - `feat/client/...`: Enhancements to member client or client API.
  - `feat/admin/...`: Enhancements to admin dashboard or admin API.
  - `chore/shared/...`: Updates to shared packages (`contracts`, `shared`, `database`).

### 6.2 Shared Package Modification Protocol
When introducing schema migrations, new enum entries, or validator modifications in `packages/*`:
1. **Zero Silent Breaking Changes:** Modifications to `@temple/*` packages impact multiple services across the monorepo.
2. Update the shared package source code first.
3. Update the corresponding architectural documentation in `docs/` (`database-design.md`, `api-documentation.md`, or `architecture.md`).
4. Verify cross-service compatibility across both server test suites before merging into `develop` or `main`.

---

## 7. Merge Verification Checklist

Prior to merging any pull request into `develop` or `main`:
- [ ] Are all enums and status constants imported from `@temple/contracts`?
- [ ] Does input validation rely exclusively on `@temple/shared/validators`?
- [ ] Do all endpoints return data using standard `@temple/contracts` envelopes (`successResponse` / `errorResponse`)?
- [ ] Are all financial and contribution records non-destructive (soft deletes only)?
- [ ] Does the change strictly comply with the 8 Core Business Principles in Section 12 of the SRS?
