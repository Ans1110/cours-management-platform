import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z
    .enum(["not_started", "in_progress", "completed"])
    .default("not_started"),
  progress: z.number().min(0).max(100).default(0),
  coverUrl: z.string().url().optional().or(z.literal("")),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  content: z.string().optional(),
  courseId: z.number().optional(),
});

export const todoSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  dueDate: z.string().optional(),
  courseId: z.number().optional(),
});

export const curriculumSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  goal: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type NoteInput = z.infer<typeof noteSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
export type CurriculumInput = z.infer<typeof curriculumSchema>;
