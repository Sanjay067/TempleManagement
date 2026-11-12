# Temple Management System

A digital platform for temple members to follow temple events, daily pooja schedules and announcements, submit contribution payment proofs, and track their personal contribution history — supported by a dedicated admin dashboard for temple operations.

---

## 🏛️ Architecture & Workspace Domains

This monorepo is organized into distinct domain workspaces to maintain clean separation of concerns while sharing core business logic:

| Domain | Workspaces | Scope & Responsibilities |
| :--- | :--- | :--- |
| **Member Portal** | `apps/client`<br>`apps/client-server` | Member Web App (React) and Member API Server (Express) |
| **Admin Portal** | `apps/admin`<br>`apps/admin-server` | Admin Dashboard (React) and Admin API Server (Express) |
| **Shared Core** | `packages/*` | Shared Contracts, Validation Rules, Domain Services, and Database Models |

---

## 📂 Repository Structure

```
temple-management/
│
├── apps/
│   ├── client/                         # Member-facing frontend (Port 3000)
│   ├── admin/                          # Admin frontend dashboard (Port 3001)
│   ├── client-server/                  # Member backend API (Port 5001)
│   └── admin-server/                   # Admin backend API (Port 5002)
│
├── packages/
│   ├── shared/                         # Shared domain logic, validators & constants
│   ├── database/                       # Shared database connection & models
│   └── contracts/                      # Shared API schemas, enums & response contracts
│
├── docs/
│   ├── requirements.md                 # Full SRS documentation (V1 Scope)
│   ├── architecture.md                 # System topology & two-server architecture
│   ├── database-design.md              # Schemas, ERD, indexes & audit invariants
│   ├── api-documentation.md            # Member & Admin API endpoints
│   └── team-collaboration-and-shared-logic.md # Architecture governance & shared logic guide
│
├── package.json
└── README.md
```

---

## 📖 Key Documentation

Please review the shared specifications before adding or changing business logic:
- **[Requirements (SRS V1)](file:///c:/Users/sanja/Developer/TempleManagement/docs/requirements.md)**: Official scope, rules, and 8 core principles.
- **[Architecture & Strategy](file:///c:/Users/sanja/Developer/TempleManagement/docs/architecture.md)**: Two-server isolation, dependency flow.
- **[Team Collaboration & Shared Logic Guide](file:///c:/Users/sanja/Developer/TempleManagement/docs/team-collaboration-and-shared-logic.md)**: How to share code via `packages/*` without duplication.
- **[Database Design](file:///c:/Users/sanja/Developer/TempleManagement/docs/database-design.md)**: Schemas, ERD, indexes, and historical audit rules.
- **[API Documentation](file:///c:/Users/sanja/Developer/TempleManagement/docs/api-documentation.md)**: Endpoint specs for both client and admin servers.

---

## ⚡ Non-Negotiable Shared Rules

1. **Zero Raw Enum Literals**: Never hardcode status strings (`'PAID'`, `'PENDING'`) in controllers. Import them from `@temple/contracts`.
2. **Never Duplicate Validation**: Use schemas from `@temple/shared/validators`.
3. **Domain Operations in Shared Services**: Fraud penalties (e.g. 5 fake attempts -> red border) live in `@temple/shared/services`.
4. **Financial Records are Permanent**: Financial and contribution records must NEVER be deleted.
