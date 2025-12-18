/**
 API Input Validation Schemas
 Centralized Zod schemas for secure input validation
 */

import { z } from "zod";

// Common Schemas

// CUID identifier validation
export const idSchema = z.string().cuid("Invalid ID format");

// Pagination parameters
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Safe string (no HTML/scripts)
export const safeStringSchema = z.string().transform((val) => {
  // Basic XSS prevention - escape HTML entities
  return val
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
});

// Auth Schemas

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain special character"),
  role: z.enum(["FAN", "CREATOR"]).default("FAN"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .toLowerCase()
    .optional(),
});

// Post Schemas

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(50000, "Content too long"),
  mediaUrl: z.string().url("Invalid media URL").optional().nullable(),
  mediaType: z.enum(["image", "video", "audio"]).optional().nullable(),
  isPaid: z.boolean().default(false),
  requiredTierId: z.string().cuid("Invalid tier ID").optional().nullable(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

// Message Schemas

export const createMessageSchema = z.object({
  creatorId: z.string().cuid("Invalid creator ID"),
  content: z.string().min(1, "Message is required").max(5000, "Message too long"),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message is required").max(5000, "Message too long"),
});

// Tip Schemas

export const createTipSchema = z.object({
  creatorId: z.string().cuid("Invalid creator ID"),
  postId: z.string().cuid("Invalid post ID").optional().nullable(),
  amount: z.union([
    z.enum(["small", "medium", "large"]),
    z.number().int().min(5000, "Minimum tip is ₹50"),
  ]),
  message: z.string().max(500, "Message too long").optional().nullable(),
});

// Product Schemas

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(5000, "Description too long").optional().nullable(),
  price: z.number().int().min(4900, "Minimum price is ₹49"),
  fileUrl: z.string().url("Invalid file URL"),
  fileType: z.string().max(50).optional().nullable(),
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Tier Schemas

export const createTierSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(500, "Description too long").optional().nullable(),
  price: z.number().int().min(9900, "Minimum price is ₹99"),
  benefits: z.array(z.string().max(200)).max(10, "Maximum 10 benefits"),
});

export const updateTierSchema = createTierSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Comment Schemas

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(2000, "Comment too long"),
});

// Profile Schemas

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

export const updateCreatorProfileSchema = z.object({
  displayName: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  coverImage: z.string().url("Invalid cover image URL").optional().nullable(),
  socialLinks: z.record(z.string(), z.string().url()).optional().nullable(),
  dmPrice: z.number().int().min(0).optional().nullable(),
});

// Utility Functions

/**
  Validate request body against a schema
  Returns parsed data or validation errors
 */
export function validateBody<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });
  
  return { success: false, errors };
}

// Parse and validate query parameters
export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return validateBody(schema, params);
}
