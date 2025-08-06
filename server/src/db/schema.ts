
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Define enums
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'completed', 'cancelled']);

// Promos table
export const promosTable = pgTable('promos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  image_url: text('image_url').notNull(),
  discount_percentage: numeric('discount_percentage', { precision: 5, scale: 2 }),
  start_date: timestamp('start_date').notNull(),
  end_date: timestamp('end_date').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  image_url: text('image_url').notNull(),
  category: text('category').notNull(),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  is_available: boolean('is_available').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Articles table
export const articlesTable = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  image_url: text('image_url'),
  category: text('category').notNull(),
  author: text('author').notNull(),
  like_count: integer('like_count').notNull().default(0),
  view_count: integer('view_count').notNull().default(0),
  is_published: boolean('is_published').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Comments table
export const commentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  article_id: integer('article_id').notNull(),
  author_name: text('author_name').notNull(),
  author_email: text('author_email').notNull(),
  content: text('content').notNull(),
  is_approved: boolean('is_approved').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Contact messages table
export const contactMessagesTable = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Service bookings table
export const serviceBookingsTable = pgTable('service_bookings', {
  id: serial('id').primaryKey(),
  customer_name: text('customer_name').notNull(),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone').notNull(),
  service_type: text('service_type').notNull(),
  vehicle_type: text('vehicle_type'),
  preferred_date: timestamp('preferred_date').notNull(),
  preferred_time: text('preferred_time').notNull(),
  notes: text('notes'),
  status: bookingStatusEnum('status').notNull().default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Export all tables for relation queries
export const tables = {
  promos: promosTable,
  products: productsTable,
  articles: articlesTable,
  comments: commentsTable,
  contactMessages: contactMessagesTable,
  serviceBookings: serviceBookingsTable
};
