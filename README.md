# Multi-Tenant Task Management System

A high-performance, secure, and scalable MERN stack application designed for professional team collaboration and project tracking.

---

##  Architecture Overview

The system follows a **Layered Monolithic Architecture** with a clear separation of concerns, built for reliability and ease of deployment.

### 1. Frontend (Client)
*   **React.js**: Modular component architecture for a dynamic User Experience.
*   **Context API**: Lightweight, native state management for Authentication and User Preferences (Theme).
*   **Tailwind CSS**: Utility-first styling for a premium, responsive design with glassmorphism effects.
*   **@dnd-kit**: Performance-optimized drag-and-drop board for Kanban workflow.

### 2. Backend (Server)
*   **Node.js & Express**: Event-driven, non-blocking I/O for high-concurrency request handling.
*   **Layered Design**:
    *   **Controllers**: HTTP request/response management.
    *   **Services**: Core business logic and database orchestration.
    *   **Middleware**: Tenant isolation, Authentication, and Input Validation.
    *   **Utils**: Reusable helpers for security and error handling.

### 3. Database
*   **MySQL**: Relational storage focusing on ACID compliance and referential integrity.
*   **Multi-tenant Model**: Shared-schema approach with strict `organizationId` isolation.

---

## Scaling Approach (10k → 100k Users)

As the platform grows from 10k to 100k users, the architecture is designed to evolve using the following strategy:

### Phase 1: Infrastructure Scaling (10k - 50k Users)
*   **Vertical Scaling**: Upgrading existing DB instances (CPU/RAM).
*   **Redis Implementation**: Transitioning rate-limiting state and frequent analytics snapshots to a distributed Redis cache to reduce DB read pressure.
*   **Horizontal API Scaling**: Deploying multiple instances of the Node.js server behind an Nginx or AWS ALB (Application Load Balancer).

### Phase 2: Architectural Scaling (50k - 100k+ Users)
*   **Database Read Replicas**: Moving read-heavy operations (Analytics/Logs) to dedicated replica nodes.
*   **Asynchronous Processing**: Moving Activity Logging and Analytics recalculations to a message queue (**BullMQ/Redis**) to keep the main event loop thread free for rapid API responses.
*   **Service Decomposition**: Identifying heavy modules (like the Analytics Engine) and spinning them off as independent microservices to scale them independently.

---

## Security Considerations

Security is baked into every layer of the application:

*   **Multi-Tenant Isolation**: A centralized middleware ensures that users can *only* interact with data belonging to their verified `organizationId`, preventing cross-tenant leakage.
*   **Stateless Authentication**: Signed **JWT (JSON Web Tokens)** are used to manage sessions securely without server-side state.
*   **Data Integrity**: Use of **Optimistic Locking** prevents data corruption during concurrent edits by multiple team members.
*   **Input Hardening**: All incoming data is sanitized and validated using **Express-Validator** to prevent SQL Injection and XSS attacks.
*   **Rate Limiting**: Protects sensitive Auth routes (Login/Register) from brute-force attempts and the overall API from DoS attacks.
*   **Encryption**: Passwords are never stored in plain text; they are hashed using **bcryptjs** with 10 salt rounds.

---

## Performance Strategy

The system is optimized for a snappy, "instant" feel:

*   **SQL Optimization**: All queries use **Raw SQL** to eliminate ORM overhead. The database is heavily indexed on foreign keys and frequently queried columns (status, dueDate).
*   **Pure SQL Aggregations**: Analytics are calculated directly in the database engine using `COUNT(CASE...)` and `GROUP BY`, which is orders of magnitude faster than processing large datasets in JavaScript.
*   **Optimistic UI Updates**: The frontend updates task positions locally before the server confirms the change, removing perceived latency for users.
*   **Lazy Loading**: Frontend routes and heavy assets are loaded only when needed to minimize initial page load time.
*   **Soft Deletes**: Uses `deletedAt` timestamps for "deletes," ensuring high-speed write operations without the cost of rearranging database indexes on disk.
