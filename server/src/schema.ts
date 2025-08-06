
import { z } from 'zod';

// Promo schema
export const promoSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  image_url: z.string(),
  discount_percentage: z.number().nullable(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Promo = z.infer<typeof promoSchema>;

export const createPromoInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  image_url: z.string().url(),
  discount_percentage: z.number().min(0).max(100).nullable(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean().default(true)
});

export type CreatePromoInput = z.infer<typeof createPromoInputSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  image_url: z.string(),
  category: z.string(),
  stock_quantity: z.number().int(),
  is_available: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  image_url: z.string().url(),
  category: z.string().min(1),
  stock_quantity: z.number().int().nonnegative(),
  is_available: z.boolean().default(true)
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Article schema
export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  image_url: z.string().nullable(),
  category: z.string(),
  author: z.string(),
  like_count: z.number().int(),
  view_count: z.number().int(),
  is_published: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Article = z.infer<typeof articleSchema>;

export const createArticleInputSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().nullable(),
  image_url: z.string().url().nullable(),
  category: z.string().min(1),
  author: z.string().min(1),
  is_published: z.boolean().default(true)
});

export type CreateArticleInput = z.infer<typeof createArticleInputSchema>;

// Comment schema
export const commentSchema = z.object({
  id: z.number(),
  article_id: z.number(),
  author_name: z.string(),
  author_email: z.string(),
  content: z.string(),
  is_approved: z.boolean(),
  created_at: z.coerce.date()
});

export type Comment = z.infer<typeof commentSchema>;

export const createCommentInputSchema = z.object({
  article_id: z.number(),
  author_name: z.string().min(1),
  author_email: z.string().email(),
  content: z.string().min(1)
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

// Contact message schema
export const contactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  subject: z.string(),
  message: z.string(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export const createContactMessageInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable(),
  subject: z.string().min(1),
  message: z.string().min(1)
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageInputSchema>;

// Service booking schema
export const serviceBookingSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  customer_email: z.string(),
  customer_phone: z.string(),
  service_type: z.string(),
  vehicle_type: z.string().nullable(),
  preferred_date: z.coerce.date(),
  preferred_time: z.string(),
  notes: z.string().nullable(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ServiceBooking = z.infer<typeof serviceBookingSchema>;

export const createServiceBookingInputSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  service_type: z.string().min(1),
  vehicle_type: z.string().nullable(),
  preferred_date: z.coerce.date(),
  preferred_time: z.string().min(1),
  notes: z.string().nullable()
});

export type CreateServiceBookingInput = z.infer<typeof createServiceBookingInputSchema>;
