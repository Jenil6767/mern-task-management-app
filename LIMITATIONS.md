# Known Limitations & Potential Improvements

This document lists the system's current boundaries, known technical weaknesses, and the planned roadmap for future enhancements.

---

## 1. Known Weaknesses

The following are existing constraints or technical choices that represent areas for improvement in a production environment:

### Infrastructure & Scaling
*   **Single Database Bottleneck:** The application currently relies on a single MySQL instance. For high-scale multi-tenant production, this would need a transition to a Master-Slave cluster or a distributed SQL solution (e.g., Vitess).
*   **Stateless Rate Limiting:** Request counts are stored in the server's local memory. In a multi-node load-balanced environment, this fails to share limits across nodes; a distributed store like **Redis** is required.
*   **Log Table Growth:** The `activity_logs` table grows linearly with every user action. Without partitioning by date or moving data to cold storage, database performance will eventually degrade.

### Security
*   **Lack of Refresh Tokens:** Currently, the system uses single-use long-lived JWTs. A production-grade security model would require a **Refresh Token rotation strategy** to balance security (short-lived access tokens) with a seamless user session.
*   **Numeric Invite Codes:** Joining an organization relies on numeric codes. While functional, this is more susceptible to brute-force guessing than a signed, single-use email invitation link system.

### Technical Debt
*   **Manual Cleanup:** There is currently no automated system for hard-deleting all data associated with a removed Organization (cascading cleanup). This can lead to "orphaned" data over time.

---

## 2. What Would Be Improved With More Time

Given additional development time, the following architectural and feature enhancements would be prioritized:

### Feature Enhancements
*   **Real-Time Collaborative Board:** Integrating **Socket.io** would allow the task board to update instantly for all team members when a card is moved, eliminating the need for manual refreshes.
*   **Full-Text Search:** Replacing basic SQL `LIKE` queries with a dedicated search engine (like **Meilisearch**) to support fuzzy searching, highlighting, and search-as-you-type functionality.
*   **Mobile App Capability (PWA):** Converting the application into a Progressive Web App (PWA) to allow "installation" on mobile devices with basic offline data access.
*   **Project Templates:** Adding the ability to create projects from pre-set templates (e.g., "Software Development," "Marketing Campaign") to speed up user onboarding.

### Architectural Improvements
*   **Advanced Data Fetching:** Moving from basic `useEffect` hooks to **TanStack Query (React Query)** to handle automatic background re-fetching, caching, and stale-state management on the frontend.
*   **Background Processing:** Implementing **BullMQ** (with Redis) to move heavy operations like analytics processing and activity logging into background worker threads, keeping the main API fast.
*   **Comprehensive Testing Suite:**
    *   **Integration Testing:** Implementing Supertest for high-coverage API boundary testing.
    *   **E2E Testing:** Using Playwright or Cypress to automate critical user journeys like the drag-and-drop board flow.
*   **Advanced Observability:** Integrating error tracking (e.g., **Sentry**) and performance monitoring (OpenTelemetry) to catch and fix issues before users report them.
