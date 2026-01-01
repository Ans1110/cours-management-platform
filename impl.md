# Course Management Platform - Implementation Log

## Completed (2026-01-01)

### Backend (Spring Boot + MyBatis-Plus)

**Authentication Module**
- `AuthController` - register/login/logout/refresh/me endpoints
- `UserService` + `UserServiceImpl` - auth business logic with BCrypt password hashing
- `JwtTokenProvider` - JWT token generation and validation
- `JwtAuthenticationFilter` - Spring Security filter for token validation
- `CustomUserDetails` + `CustomUserDetailsService` - Spring Security user details
- DTOs: `LoginRequest`, `RegisterRequest`, `AuthResponse`
- Updated `SecurityConfig` with JWT filter and CORS

**Course Module**
- Updated `CourseController` with user-scoped operations and progress endpoint
- Updated `CourseService` + `CourseServiceImpl` with user-scoped methods

**Notes Module**
- `NoteController` - CRUD with course filtering
- `NoteService` + `NoteServiceImpl` - user-scoped operations

**Todos Module**
- `TodoController` - CRUD with status update endpoint
- `TodoService` + `TodoServiceImpl` - user-scoped operations

**Curriculum Module**
- `CurriculumController` - CRUD with course management (add/remove/reorder)
- `CurriculumService` + `CurriculumServiceImpl` - with course ordering

---

### Frontend (React 19 + TypeScript + Tailwind)

**API Layer**
- `api/client.ts` - Fetch wrapper with auth interceptors and token refresh
- `api/auth.ts` - Authentication endpoints
- `api/courses.ts`, `api/notes.ts`, `api/todos.ts`, `api/curriculums.ts` - CRUD endpoints

**State Management**
- `stores/authStore.ts` - Zustand store with persist middleware for auth state
- `types/index.ts` - TypeScript interfaces for all entities
- `schemas/index.ts` - Zod validation schemas

**Pages**
- `LoginPage.tsx` - Login form with validation and dark theme
- `RegisterPage.tsx` - Registration form with password confirmation
- `DashboardPage.tsx` - Stats overview with recent courses and pending tasks
- `CoursesPage.tsx` - Course list with CRUD modal and progress display
- `NotesPage.tsx` - Notes list with course linking
- `TodosPage.tsx` - Todo list with status toggle and filtering
- `CurriculumsPage.tsx` - Curriculum list with goals display

**Layout & Components**
- `MainLayout.tsx` - Responsive sidebar with navigation and user section
- `ProtectedRoute.tsx` - Auth guard for protected pages
- shadcn/ui components: Button, Input, Label, Card

**Routing**
- React Router 7 with nested routes
- React Query for server state management

---

### Git Commits

1. `feat: add authentication module with JWT support`
2. `feat: add Notes, Todos, and Curriculum backend modules`
3. `feat: add complete frontend implementation`

---

### To Run

**Backend:**
```bash
cd backend
# Ensure MySQL is running with database `course_management` created
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
bun install
bun run dev
```

Access at `http://localhost:5173`
