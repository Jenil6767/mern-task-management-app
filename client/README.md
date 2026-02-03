# Task Manager Frontend

React-based frontend for a multi-tenant task management system.

## Features
- JWT Authentication
- Protected routes (auto-redirect if not authenticated)
- Project list with cards
- Kanban board with drag-and-drop
- **Optimistic UI updates** with rollback on failure
- Task CRUD (create/edit/delete)
- Task filtering (assignee, priority) + debounced search
- Pagination (20 per page)
- Tailwind responsive UI + toast notifications

## Setup

```bash
cd client
npm install
copy .env.example .env
# Edit .env with your API URL
npm run dev
```

## Tech Stack
- React 18 + Vite
- React Router v6
- Axios
- @dnd-kit
- Tailwind CSS
- React Hot Toast

## API Endpoints Used
- POST `/api/auth/login`
- GET `/api/projects`
- POST `/api/projects`
- GET `/api/projects/:id/tasks`
- POST `/api/tasks`
- PUT `/api/tasks/:id`
- PATCH `/api/tasks/:id`
- DELETE `/api/tasks/:id`
- GET `/api/users`

## Environment Variables
- `VITE_API_URL`: Backend API base URL (example: `http://localhost:5000/api`)


