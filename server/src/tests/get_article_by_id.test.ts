
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type CreateArticleInput } from '../schema';
import { getArticleById } from '../handlers/get_article_by_id';
import { eq } from 'drizzle-orm';

// Test article input
const testArticleInput: CreateArticleInput = {
  title: 'Test Article',
  content: 'This is test content for the article.',
  excerpt: 'Test excerpt',
  image_url: 'https://example.com/image.jpg',
  category: 'Technology',
  author: 'Test Author',
  is_published: true
};

describe('getArticleById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return article by id and increment view count', async () => {
    // Create test article
    const insertResult = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published
      })
      .returning()
      .execute();

    const createdArticle = insertResult[0];
    const initialViewCount = createdArticle.view_count;

    const result = await getArticleById(createdArticle.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdArticle.id);
    expect(result!.title).toEqual('Test Article');
    expect(result!.content).toEqual('This is test content for the article.');
    expect(result!.excerpt).toEqual('Test excerpt');
    expect(result!.image_url).toEqual('https://example.com/image.jpg');
    expect(result!.category).toEqual('Technology');
    expect(result!.author).toEqual('Test Author');
    expect(result!.like_count).toEqual(0);
    expect(result!.view_count).toEqual(initialViewCount + 1);
    expect(result!.is_published).toBe(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update view count in database', async () => {
    // Create test article
    const insertResult = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published
      })
      .returning()
      .execute();

    const createdArticle = insertResult[0];
    const initialViewCount = createdArticle.view_count;

    await getArticleById(createdArticle.id);

    // Verify view count was incremented in database
    const articles = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, createdArticle.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].view_count).toEqual(initialViewCount + 1);
  });

  it('should return null for non-existent article', async () => {
    const result = await getArticleById(999);

    expect(result).toBeNull();
  });

  it('should increment view count on multiple calls', async () => {
    // Create test article
    const insertResult = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published
      })
      .returning()
      .execute();

    const createdArticle = insertResult[0];
    const initialViewCount = createdArticle.view_count;

    // Call handler multiple times
    const result1 = await getArticleById(createdArticle.id);
    const result2 = await getArticleById(createdArticle.id);
    const result3 = await getArticleById(createdArticle.id);

    expect(result1!.view_count).toEqual(initialViewCount + 1);
    expect(result2!.view_count).toEqual(initialViewCount + 2);
    expect(result3!.view_count).toEqual(initialViewCount + 3);

    // Verify final view count in database
    const articles = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, createdArticle.id))
      .execute();

    expect(articles[0].view_count).toEqual(initialViewCount + 3);
  });
});
