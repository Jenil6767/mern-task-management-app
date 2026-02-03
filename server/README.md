# Multi-Tenant Task Management Backend

A production-ready Node.js + Express backend for a multi-tenant task management system with Role-Based Access Control (RBAC), multi-tenant isolation, and race condition prevention.

## Features

- **Multi-Tenancy**: Organization-level isolation ensures users only see data belonging to their organization.
- **RBAC**: Admin and Member roles with specific permissions.
- **Race Condition Prevention**: Optimistic locking using a versioning system for task updates.
- **Activity Logging**: Automatic tracking of creation, updates, status changes, and deletions.
- **DB-Optimized Analytics**: Pure SQL aggregations for high-performance metrics.
- **Security**: JWT authentication, bcrypt hashing, Helmet security headers, and rate limiting.
- **Soft Deletes**: Data preservation for audit trails.

## Database Schema

The system uses five main entities:
1.  **Organizations**: Tenant containers.
2.  **Users**: Employees with roles (Admin/Member).
3.  **Projects**: Groups of tasks.
4.  **Tasks**: Individual work items with status, priority, and assignments.
5.  **ActivityLogs**: Audit trail for task operations.

Refer to `src/migrations/init.sql` for the full schema and constraints.

## API Endpoints

### Auth
- `POST /api/auth/register`: Register and create/join organization.
- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/auth/me`: Get current user profile.

### Projects
- `POST /api/projects`: Create project (Admin only).
- `GET /api/projects`: List projects in organization.
- `GET /api/projects/:id`: Get project details.
- `PUT /api/projects/:id`: Update project (Admin only).
- `POST /api/projects/:id/assign`: Assign users to project (Admin only).
- `DELETE /api/projects/:id`: Soft delete project (Admin only).
- `GET /api/projects/:projectId/tasks`: List tasks for a project with filters.

### Tasks
- `POST /api/tasks`: Create task.
- `GET /api/tasks/:id`: Get task details.
- `PUT /api/tasks/:id`: Full task update.
- `PATCH /api/tasks/:id/status`: Update status with optimistic locking (requires `version`).
- `DELETE /api/tasks/:id`: Soft delete task.

### Analytics & Activity
- `GET /api/analytics`: Organization-wide analytics.
- `GET /api/analytics?projectId=ID`: Project-specific analytics.
- `GET /api/activity`: Retrieve activity logs (supports `taskId`, `userId`, `projectId` filters).

## Optimistic Locking Explanation

To prevent two users from overwriting each other's changes (race conditions), the task update endpoint uses versioning:
1.  The client sends the current `version` of the task.
2.  The server executes: `UPDATE tasks SET status = ?, version = version + 1 WHERE id = ? AND version = ?`.
3.  If `affectedRows` is 0, it means someone else updated the task. The server returns `409 Conflict`.
4.  The client must refresh the data and retry with the new version.

## Setup Instructions

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    cd server
    npm install
    ```
3.  **Configure Environment**:
    - Copy `.env.example` to `.env`.
    - Update `DB_*` and `JWT_SECRET` variables.
4.  **Database Migration**:
    - Run the SQL script in `src/migrations/init.sql` against your MySQL database.
5.  **Run the Server**:
    ```bash
    npm run dev
    ```

## Performance & Scalability

- **Indexing**: Frequent queries (org isolation, status filters, due dates) are optimized with indexes.
- **Aggregations**: Analytics use pure SQL to handle large datasets efficiently without JavaScript loops.
- **Connection Pooling**: Uses `mysql2` connection pooling to manage DB connections effectively.

## Security

- **Bcrypt**: 10 salt rounds for password hashing.
- **JWT**: Bearer tokens with 24-hour expiration.
- **Helmet**: Common security HTTP headers.
- **Rate Limiting**: Brute-force protection on login and general API limiting.
- **Sanitization**: All inputs are validated/sanitized using `express-validator`.
- **SQL Injection Prevention**: All queries use parameterized statements.
