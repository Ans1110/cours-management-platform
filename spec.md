# Course Management Platform - Specification

## 1. Overview

A full-stack course management platform that allows users to organize their learning resources, track progress, and manage study materials efficiently.

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| React Router | 7 | Client-side routing, data mode |
| TypeScript | 5+ | Type safety |
| Zustand | 4+ | State management |
| Zod | 3 | Schema validation |
| React Hook Form | 7+ | Form handling |
| shadcn/ui | new | UI components |
| Tailwind CSS | 4 | Utility-first CSS framework |
| lucide-react | new | Icon library |
| TanStack Query | 5+ | Server state management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3+ | Application framework |
| MyBatis-Plus | 3+ | ORM framework |
| PostgreSQL | 15+ | Database |
| Spring Security | 6+ | Authentication & Authorization |

---

## 3. Core Features

### 3.1 Course Management
- Create, read, update, delete (CRUD) courses
- Course metadata: title, description, category, status, progress
- Course categorization and tagging
- Course progress tracking

### 3.2 Notes Management
- Rich text notes with markdown support
- File attachments (PDF, images, documents)
- External link references
- Notes linked to specific courses
- Search and filter notes

### 3.3 Custom Curriculum
- Create personalized learning paths
- Organize courses into curriculum
- Set learning goals and milestones
- Drag-and-drop curriculum builder
- Progress visualization

### 3.4 Todo List
- Task creation with due dates
- Priority levels (high, medium, low)
- Link tasks to courses/notes
- Task status tracking
- Reminders and notifications

---

## 4. Authentication & Authorization

### 4.1 JWT + Bearer Token
- Access token (short-lived: 15 minutes)
- Refresh token (long-lived: 7 days)
- Token stored in httpOnly cookies
- Automatic token refresh

### 4.2 OAuth 2.0 Integration
- Google OAuth
- GitHub OAuth
- Account linking for existing users

### 4.3 Security Features
- Password hashing (BCrypt)
- Rate limiting
- CORS configuration
- CSRF protection

---

## 5. API Design (RESTful)

### 5.1 Authentication Endpoints
```
POST   /api/v1/auth/register          # User registration
POST   /api/v1/auth/login             # User login
POST   /api/v1/auth/logout            # User logout
POST   /api/v1/auth/refresh           # Refresh token
GET    /api/v1/auth/oauth/{provider}  # OAuth initiation
GET    /api/v1/auth/oauth/callback    # OAuth callback
```

### 5.2 Course Endpoints
```
GET    /api/v1/courses                # List all courses
POST   /api/v1/courses                # Create course
GET    /api/v1/courses/{id}           # Get course by ID
PUT    /api/v1/courses/{id}           # Update course
DELETE /api/v1/courses/{id}           # Delete course
PATCH  /api/v1/courses/{id}/progress  # Update progress
```

### 5.3 Notes Endpoints
```
GET    /api/v1/notes                  # List all notes
POST   /api/v1/notes                  # Create note
GET    /api/v1/notes/{id}             # Get note by ID
PUT    /api/v1/notes/{id}             # Update note
DELETE /api/v1/notes/{id}             # Delete note
POST   /api/v1/notes/{id}/attachments # Upload attachment
DELETE /api/v1/notes/{id}/attachments/{attachmentId}
```

### 5.4 Curriculum Endpoints
```
GET    /api/v1/curriculums            # List curriculums
POST   /api/v1/curriculums            # Create curriculum
GET    /api/v1/curriculums/{id}       # Get curriculum by ID
PUT    /api/v1/curriculums/{id}       # Update curriculum
DELETE /api/v1/curriculums/{id}       # Delete curriculum
POST   /api/v1/curriculums/{id}/courses/{courseId}  # Add course
DELETE /api/v1/curriculums/{id}/courses/{courseId}  # Remove course
```

### 5.5 Todo Endpoints
```
GET    /api/v1/todos                  # List all todos
POST   /api/v1/todos                  # Create todo
GET    /api/v1/todos/{id}             # Get todo by ID
PUT    /api/v1/todos/{id}             # Update todo
DELETE /api/v1/todos/{id}             # Delete todo
PATCH  /api/v1/todos/{id}/status      # Update status
```

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Course    │────<│    Note     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Todo     │     │ Curriculum  │────<│ Attachment  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 6.2 Tables

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NULL (for OAuth users) |
| name | VARCHAR(100) | NOT NULL |
| avatar_url | VARCHAR(500) | NULL |
| provider | VARCHAR(50) | DEFAULT 'local' |
| provider_id | VARCHAR(255) | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### courses
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| category | VARCHAR(100) | NULL |
| status | VARCHAR(50) | DEFAULT 'not_started' |
| progress | INTEGER | DEFAULT 0 |
| cover_url | VARCHAR(500) | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### notes
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| course_id | BIGINT | FOREIGN KEY → courses(id), NULL |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### attachments
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| note_id | BIGINT | FOREIGN KEY → notes(id) |
| file_name | VARCHAR(255) | NOT NULL |
| file_type | VARCHAR(100) | NOT NULL |
| file_url | VARCHAR(500) | NOT NULL |
| file_size | BIGINT | NOT NULL |
| link_url | VARCHAR(500) | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### curriculums
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| goal | TEXT | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### curriculum_courses
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| curriculum_id | BIGINT | FOREIGN KEY → curriculums(id) |
| course_id | BIGINT | FOREIGN KEY → courses(id) |
| order_index | INTEGER | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### todos
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGSERIAL | PRIMARY KEY |
| user_id | BIGINT | FOREIGN KEY → users(id) |
| course_id | BIGINT | FOREIGN KEY → courses(id), NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| priority | VARCHAR(20) | DEFAULT 'medium' |
| status | VARCHAR(50) | DEFAULT 'pending' |
| due_date | TIMESTAMP | NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

## 7. Project Structure

### 7.1 Frontend Structure
```
frontend/
├── src/
│   ├── api/              # API client & endpoints
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Buttons, inputs, modals
│   │   ├── course/       # Course-related components
│   │   ├── note/         # Note-related components
│   │   ├── curriculum/   # Curriculum components
│   │   └── todo/         # Todo components
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # Page layouts
│   ├── pages/            # Route pages
│   ├── schemas/          # Zod validation schemas
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 7.2 Backend Structure (MVC)
```
backend/
├── src/main/java/com/coursemanagement/
│   ├── config/           # Configuration classes
│   ├── controller/       # REST controllers
│   ├── service/          # Business logic
│   │   └── impl/          # Service implementations
│   ├── repository/       # Data access layer
│   ├── mapper/           # MyBatis mappers
│   ├── model/            # Entity models
│   │   ├── entity/       # Database entities
│   │   ├── dto/          # Data transfer objects
│   │   └── vo/           # View objects
│   ├── security/         # JWT & OAuth config
│   ├── exception/        # Custom exceptions
│   └── util/             # Utility classes
├── src/main/resources/
│   ├── mapper/           # MyBatis XML files
│   ├── application.yml
│   └── schema.sql
└── pom.xml
```

---

## 8. Non-Functional Requirements

### 8.1 Performance
- API response time < 200ms (95th percentile)
- Support 1000 concurrent users
- File upload limit: 50MB

### 8.2 Security
- HTTPS only in production
- SQL injection prevention
- XSS protection
- Input validation on all endpoints

### 8.3 Scalability
- Stateless backend (horizontal scaling ready)
- Database connection pooling
- CDN for static assets

---

### 9. git

Atomic commit

feat
fix
docs
style
refactor
perf
test
chore
revert

```
git init
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Ans1110/cours-management-platform.git
git push -u origin main
```