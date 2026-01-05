# Course Management Platform

A full-stack course management platform for organizing learning resources, tracking progress, and managing study materials.

## Live Demo

- **Frontend:** https://course-management-st.up.railway.app/
- **Backend API:** https://cours-management-platform-api.up.railway.app

## Features

- **Course Management** - Create, organize, and track courses with progress monitoring
- **Notes** - Rich text notes with file attachments
- **Custom Curriculum** - Build personalized learning paths with drag-and-drop
- **Todo List** - Task management with priorities and due dates
- **Authentication** - JWT-based auth with Google and GitHub OAuth support

## Tech Stack

### Frontend
- React 19 + TypeScript
- React Router 7 (data mode)
- TanStack Query 5
- Zustand (state management)
- React Hook Form + Zod (forms & validation)
- shadcn/ui + Tailwind CSS
- Vite

### Backend
- Spring Boot 3
- Spring Security 6 (JWT + OAuth 2.0)
- MyBatis-Plus 3
- MySQL

## Getting Started

### Prerequisites
- Node.js 18+ / Bun
- Java 17+
- MySQL 8+

### Frontend

```bash
cd frontend
bun install
bun run dev
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

## Project Structure

```
├── frontend/
│   └── src/
│       ├── api/          # API client & endpoints
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Route pages
│       ├── schemas/      # Zod validation
│       └── stores/       # Zustand stores
│
├── backend/
│   └── src/main/java/
│       ├── controller/   # REST controllers
│       ├── service/      # Business logic
│       ├── mapper/       # MyBatis mappers
│       ├── model/        # Entities, DTOs, VOs
│       └── security/     # JWT & OAuth config
```

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | `/api/v1/auth/*` - Login, register, OAuth |
| Courses | `/api/v1/courses/*` - CRUD + progress |
| Notes | `/api/v1/notes/*` - CRUD + attachments |
| Curriculums | `/api/v1/curriculums/*` - Learning paths |
| Todos | `/api/v1/todos/*` - Task management |
