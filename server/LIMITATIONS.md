# Known Limitations & Potential Improvements

This document lists current limitations and areas for future architectural improvement.

## 1. Scalability Bottlenecks
- **Single Database Instance:** Currently relies on a single MySQL instance. As tenants grow, this would need to scale vertically or move to a sharded/cluster-based approach (e.g., Vitess or Amazon Aurora).
- **In-Memory Rate Limiting:** `express-rate-limit` stores request counts in memory. In a multi-node/load-balanced environment, this should be moved to a Redis store to ensure consistent limits across server instances.

## 2. Security & Authentication
- **No Refresh Tokens:** Currently only short-lived (or long-lived, based on config) JWTs are used. Implementing a refresh token rotation strategy would provide a better balance between security and user experience.
- **Invitation Logic:** The invitation system is basic (joining by invite code). A more robust system would involve email-based invitations with unique, single-use signed tokens.

## 3. Performance
- **Activity Log Growth:** The `activity_logs` table could grow very large. Implementing a partitioning strategy by date or moving old logs to a cold storage (e.g., S3 or a dedicated logging DB) would eventually be necessary.
- **Real-time Updates:** Currently, users must poll or refresh to see changes. Implementing WebSockets (Socket.io) would allow real-time notifications for task status changes and assignment updates.

## 4. Feature Set
- **Search Optimization:** The `LIKE %search%` query is not efficient for very large datasets. Moving search to a Full-Text Index or a dedicated engine like Elasticsearch/Meilisearch would improve performance and search quality.
- **File Attachments:** The system currently doesn't support task attachments. Integrating with S3 or similar would be a natural next step.

## 5. Technical Debt
- **Missing Integration Tests:** While the architecture is modular, comprehensive integration tests (using Supertest) would be required to ensure all boundaries and race conditions are fully covered in CI/CD.
- **Organization Deletion:** Currently, there is no logic for deleting an entire organization (cascading deletes or bulk soft deletes).
