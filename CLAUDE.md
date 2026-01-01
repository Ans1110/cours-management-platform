# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack course management platform for organizing learning resources, tracking progress, and managing study materials. This is a greenfield project - refer to `spec.md` for complete requirements.

## Commands

### Frontend (from `frontend/` directory)

```bash
bun install                      # Install dependencies
bun run dev                      # Start dev server
bun run build                    # Build for production
bun run lint                     # Run ESLint
bunx shadcn@latest add <name>    # Add shadcn/ui component
```

### Backend (from `backend/` directory)

```bash
./mvnw spring-boot:run           # Start dev server
./mvnw clean package             # Build JAR
./mvnw test                      # Run tests
./mvnw test -Dtest=TestClass     # Run single test class
```

## Technology Stack

**Frontend:** React 19, React Router 7 (data mode), TypeScript 5+, Zustand 4+, TanStack Query 5+, Zod 3, React Hook Form 7+, shadcn/ui, Tailwind CSS, Vite, lucide-react

**Backend:** Spring Boot 3+, MyBatis-Plus 3+, MySQL 8+, Spring Security 6+

## Architecture

### Frontend (MVC-like)

- `src/api/` - API client and endpoint definitions
- `src/components/ui/` - shadcn/ui components
- `src/components/` - Reusable UI components organized by domain (course/, note/, curriculum/, todo/, common/)
- `src/hooks/` - Custom React hooks
- `src/stores/` - Zustand state stores
- `src/schemas/` - Zod validation schemas
- `src/pages/` - Route pages
- `src/layouts/` - Page layouts

### Backend (MVC)
- `controller/` - REST controllers
- `service/` + `service/impl/` - Business logic layer
- `repository/` - Data access layer
- `mapper/` - MyBatis mappers with XML in `resources/mapper/`
- `model/entity/` - Database entities
- `model/dto/` - Data transfer objects
- `model/vo/` - View objects
- `security/` - JWT & OAuth configuration
- `config/` - Configuration classes

## API Design

RESTful API with base path `/api/v1/`. Main resources:
- `/auth/*` - Authentication (JWT + OAuth)
- `/courses/*` - Course CRUD + progress
- `/notes/*` - Notes CRUD + attachments
- `/curriculums/*` - Learning paths with course ordering
- `/todos/*` - Tasks with priorities and due dates

## Authentication

JWT with Bearer tokens:
- Access token: 15 minutes
- Refresh token: 7 days
- Tokens stored in httpOnly cookies
- OAuth 2.0: Google and GitHub

## Git Commit Convention

Use atomic commits with conventional prefixes: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`
