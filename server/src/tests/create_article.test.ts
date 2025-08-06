
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type CreateArticleInput } from '../schema';
import { createArticle } from '../handlers/create_article';
import { eq, and, gte } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateArticleInput = {
  title: 'Test Article',
  content: 'This is the content of the test article. It contains multiple sentences to test the content field.',
  excerpt: 'This is a test excerpt',
  image_url: 'https://example.com/test-image.jpg',
  category: 'Technology',
  author: 'Test Author',
  is_published: true
};

// Test input without optional fields
const minimalInput: CreateArticleInput = {
  title: 'Minimal Article',
  content: 'Minimal content for testing.',
  excerpt: null,
  image_url: null,
  category: 'General',
  author: 'Test Author',
  is_published: false
};

describe('createArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an article with all fields', async () => {
    const result = await createArticle(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.excerpt).toEqual('This is a test excerpt');
    expect(result.image_url).toEqual('https://example.com/test-image.jpg');
    expect(result.category).toEqual('Technology');
    expect(result.author).toEqual('Test Author');
    expect(result.is_published).toEqual(true);
    expect(result.like_count).toEqual(0);
    expect(result.view_count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an article with minimal fields', async () => {
    const result = await createArticle(minimalInput);

    // Validate required fields
    expect(result.title).toEqual('Minimal Article');
    expect(result.content).toEqual('Minimal content for testing.');
    expect(result.category).toEqual('General');
    expect(result.author).toEqual('Test Author');
    expect(result.is_published).toEqual(false);

    // Validate nullable fields
    expect(result.excerpt).toBeNull();
    expect(result.image_url).toBeNull();

    // Validate default values
    expect(result.like_count).toEqual(0);
    expect(result.view_count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save article to database', async () => {
    const result = await createArticle(testInput);

    // Query using proper drizzle syntax
    const articles = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Test Article');
    expect(articles[0].content).toEqual(testInput.content);
    expect(articles[0].category).toEqual('Technology');
    expect(articles[0].author).toEqual('Test Author');
    expect(articles[0].is_published).toEqual(true);
    expect(articles[0].like_count).toEqual(0);
    expect(articles[0].view_count).toEqual(0);
    expect(articles[0].created_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at).toBeInstanceOf(Date);
  });

  it('should query articles by category and publication status', async () => {
    // Create multiple test articles
    await createArticle(testInput);
    await createArticle({ ...testInput, category: 'Science', is_published: false });
    await createArticle({ ...testInput, category: 'Technology', title: 'Another Tech Article' });

    // Query published Technology articles
    const articles = await db.select()
      .from(articlesTable)
      .where(and(
        eq(articlesTable.category, 'Technology'),
        eq(articlesTable.is_published, true)
      ))
      .execute();

    expect(articles).toHaveLength(2);
    articles.forEach(article => {
      expect(article.category).toEqual('Technology');
      expect(article.is_published).toEqual(true);
    });
  });

  it('should handle date filtering correctly', async () => {
    // Create test article
    await createArticle(testInput);

    // Test date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day

    const articles = await db.select()
      .from(articlesTable)
      .where(gte(articlesTable.created_at, today))
      .execute();

    expect(articles.length).toBeGreaterThan(0);
    articles.forEach(article => {
      expect(article.created_at).toBeInstanceOf(Date);
      expect(article.created_at >= today).toBe(true);
    });
  });
});
