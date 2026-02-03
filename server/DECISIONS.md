# Architecture & Design Decisions

This document outlines the key technical decisions made during the development of the Multi-Tenant Task Management Backend.

## 1. Choice of Database & Driver (MySQL + `mysql2/promise`)
**Decision:** Used raw MySQL with the `mysql2/promise` library instead of an ORM like Sequelize or TypeORM.

**Rationale:**
- **Performance:** Raw SQL offers better performance for complex aggregations (as required for the analytics module).
- **Control:** Allows full control over indexing and query optimization.
- **Transparency:** Makes it clear exactly what queries are being executed, which is critical for security audits and debugging organization isolation.
- **Simplification:** Avoids the overhead and "magic" of an ORM for a focused set of requirements.

## 2. Race Condition Prevention: Optimistic Locking
**Decision:** Implemented **Optimistic Locking** using a `version` column in the `tasks` table.

**Rationale:**
- **User Experience:** Assuming concurrent updates are relatively rare, optimistic locking is more performant than pessimistic locking (which locks the row for the duration of the transaction).
- **Detection:** It correctly detects if a task was modified between the time the user read it and the time they tried to update it.
- **Implementation:** Integrated into the `UPDATE` query's `WHERE` clause (`WHERE id = ? AND version = ?`), ensuring atomicity at the database level.

## 3. Data Integrity: Soft Deletes
**Decision:** Implemented **Soft Deletes** using a `deletedAt` timestamp.

**Rationale:**
- **Audit Trail:** Preserves history for activity logs and analytics.
- **Accidental Deletion:** Allows for potential "undelete" or recovery operations if needed.
- **Consistency:** Ensures that `ActivityLogs` referencing deleted tasks don't break foreign key constraints (or can be maintained for history).

## 4. Security: Multi-Tenant Isolation
**Decision:** Enforced isolation at the service layer by always including `organizationId` in `WHERE` clauses and joining with `projects` or `users` to verify ownership.

**Rationale:**
- **Robustness:** A custom middleware (`tenantIsolation.js`) ensures the `organizationId` is always available from the JWT.
- **Safety:** By requiring the `organizationId` in every query, we prevent cross-tenant data leaks even if an ID is guessed.

## 5. Optimized Analytics: Pure SQL Aggregations
**Decision:** Performed all analytics calculations using SQL `GROUP BY`, `COUNT(CASE WHEN...)`, and `AVG()` directly in the database.

**Rationale:**
- **Efficiency:** Processing 10k+ records in JavaScript would be slow and memory-intensive. SQL engines are highly optimized for these operations.
- **Consistency:** Ensures calculations are always based on the latest state of the data in a single atomical view.

## 6. Project Structure: Layered Architecture
**Decision:** Separated concerns into Controllers (HTTP handling), Services (Business Logic), and Middleware (Cross-cutting concerns).

**Rationale:**
- **Maintainability:** Clear separation makes the code easier to test and extend.
- **Reusability:** Business logic in services can be reused across different controllers or even background tasks.
