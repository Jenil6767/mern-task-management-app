# Architecture & Design Decisions

This document outlines the key technical decisions, tradeoffs, and scope considerations made during the development of the MERN Task Management system.

---

## 1. Choice of Database & Model (Relational/MySQL)

The system utilizes a normalized relational schema with **MySQL**.

**Why this model was chosen:**
*   **Structured Data Relationships:** Task management is inherently relational. A project belongs to an organization, tasks belong to projects, and users are assigned to tasks. MySQL handles these many-to-one and many-to-many relationships with high integrity.
*   **Referential Integrity:** By using Foreign Keys, we ensure that tasks cannot exist without a project and users cannot be assigned to tasks outside their organization.
*   **ACID Compliance:** Transactions ensure that project state changes (like task movement or deletes) are atomic. If a database operation fails halfway, the system rolls back to a safe state.
*   **Analytics Power:** Generating management insights requires complex joins and aggregations. SQL's engine is highly optimized for these operations compared to application-level data manipulation in NoSQL.

---

## 2. Technical Tradeoffs Made

During development, we made specific choices to balance performance, transparency, and maintenance:

### Raw SQL Queries vs. ORM (Sequelize/TypeORM)
*   **Tradeoff:** We chose **Raw SQL (`mysql2/promise`)** over an ORM.
*   **Reasoning:** While an ORM speeds up initial development, raw SQL offers better performance and full transparency. This makes it easier to optimize indexes and audit exactly how data isolation is enforced between tenants.

### Optimistic vs. Pessimistic Locking
*   **Tradeoff:** We chose **Optimistic Locking** (using a `version` column).
*   **Reasoning:** This allows the system to handle multiple users without locking database rows, which would hurt performance. Instead, it checks for version conflicts only during the update, providing a better user experience for a collaborative tool.

### Shared Schema Multi-Tenancy
*   **Tradeoff:** We chose a **Shared Schema** approach with an `organizationId` filter.
*   **Reasoning:** This minimizes infrastructure costs and management overhead compared to a "database-per-tenant" model. We mitigated the risk of data leaks by enforcing tenant isolation at the middleware level.

---

## 3. Deprioritized Features (Scope Rationale)

To ensure a high-quality "Core" experience within the project timeframe, the following features were deprioritized:

*   **Redis Caching Layer:** Given our highly optimized SQL queries and indexes, a caching layer would have added infrastructure complexity without a significant immediate performance gain.
*   **WebSockets for Real-time Updates:** We prioritized **Optimistic UI updates** on the frontend. This gives the user an "instant" feel without the overhead of managing persistent socket connections in a stateless backend.
*   **Background Job Queues (BullMQ):** Operations like activity logging are currently synchronous. For an MVP, the latency cost is negligible, though this remains an item for future architectural scaling.
*   **Refresh Token Rotation:** We utilized single long-lived JWTs for simplicity, whereas a production-grade system would require a more complex token rotation strategy.

---

## 4. Additional Core Decisions

### Frontend: React Context & Portals
*   **Context API:** Chosen for state management (Auth/Theme) to avoid the boilerplate of Redux while maintaining a clean, reactive flow.
*   **Portals:** Used for modals to ensure they always render at the document root, preventing Z-Index and CSS nesting issues.

### Security Implementation
*   **Bcryptjs:** Used for secure password hashing.
*   **Express-Validator:** Enforced strict schema validation on all API endpoints to prevent malformed data entry.
*   **Rate Limiting:** Implemented to safeguard the API against brute-force and DoS attempts.
