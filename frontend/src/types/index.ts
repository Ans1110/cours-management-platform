// TypeScript types for all entities

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface Course {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category?: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  coverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number;
  userId: number;
  courseId?: number;
  title: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  noteId: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  linkUrl?: string;
  createdAt: string;
}

export interface Todo {
  id: number;
  userId: number;
  courseId?: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Curriculum {
  id: number;
  userId: number;
  title: string;
  description?: string;
  goal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumCourse {
  id: number;
  curriculumId: number;
  courseId: number;
  orderIndex: number;
  createdAt: string;
}

// Input types for create/update
export type CreateCourse = Omit<
  Course,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateCourse = Partial<CreateCourse>;

export type CreateNote = Omit<
  Note,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateNote = Partial<CreateNote>;

export type CreateTodo = Omit<
  Todo,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateTodo = Partial<CreateTodo>;

export type CreateCurriculum = Omit<
  Curriculum,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateCurriculum = Partial<CreateCurriculum>;
