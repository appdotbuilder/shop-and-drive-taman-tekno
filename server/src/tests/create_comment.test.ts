
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { commentsTable, articlesTable } from '../db/schema';
import { type CreateCommentInput } from '../schema';
import { createComment } from '../handlers/create_comment';
import { eq } from 'drizzle-orm';

// Test article setup
const testArticle = {
  title: 'Test Article',
  content: 'Test content for article',
  excerpt: 'Test excerpt',
  image_url: 'https://example.com/image.jpg',
  category: 'test',
  author: 'Test Author',
  is_published: true
};

// Simple test input
const testInput: CreateCommentInput = {
  article_id: 1, // Will be set after creating article
  author_name: 'John Doe',
  author_email: 'john@example.com',
  content: 'This is a test comment'
};

describe('createComment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a comment', async () => {
    // Create prerequisite article first
    const article = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();

    const commentInput = {
      ...testInput,
      article_id: article[0].id
    };

    const result = await createComment(commentInput);

    // Basic field validation
    expect(result.article_id).toEqual(article[0].id);
    expect(result.author_name).toEqual('John Doe');
    expect(result.author_email).toEqual('john@example.com');
    expect(result.content).toEqual('This is a test comment');
    expect(result.is_approved).toEqual(false); // Should default to false
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save comment to database', async () => {
    // Create prerequisite article first
    const article = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();

    const commentInput = {
      ...testInput,
      article_id: article[0].id
    };

    const result = await createComment(commentInput);

    // Query using proper drizzle syntax
    const comments = await db.select()
      .from(commentsTable)
      .where(eq(commentsTable.id, result.id))
      .execute();

    expect(comments).toHaveLength(1);
    expect(comments[0].article_id).toEqual(article[0].id);
    expect(comments[0].author_name).toEqual('John Doe');
    expect(comments[0].author_email).toEqual('john@example.com');
    expect(comments[0].content).toEqual('This is a test comment');
    expect(comments[0].is_approved).toEqual(false);
    expect(comments[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when article does not exist', async () => {
    const commentInput = {
      ...testInput,
      article_id: 999 // Non-existent article
    };

    await expect(createComment(commentInput)).rejects.toThrow(/Article with id 999 not found/i);
  });

  it('should set is_approved to false by default', async () => {
    // Create prerequisite article first
    const article = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();

    const commentInput = {
      ...testInput,
      article_id: article[0].id
    };

    const result = await createComment(commentInput);

    expect(result.is_approved).toEqual(false);
  });
});
