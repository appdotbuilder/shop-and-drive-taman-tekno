
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type CreateArticleInput } from '../schema';
import { likeArticle } from '../handlers/like_article';
import { eq } from 'drizzle-orm';

// Test article input
const testArticleInput: CreateArticleInput = {
  title: 'Test Article',
  content: 'This is a test article content.',
  excerpt: 'Test excerpt',
  image_url: 'https://example.com/image.jpg',
  category: 'Technology',
  author: 'Test Author',
  is_published: true
};

describe('likeArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment like count for existing article', async () => {
    // Create test article
    const [createdArticle] = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published,
        like_count: 5 // Start with 5 likes
      })
      .returning()
      .execute();

    const result = await likeArticle(createdArticle.id);

    // Verify the article was returned with incremented like count
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdArticle.id);
    expect(result!.title).toEqual('Test Article');
    expect(result!.like_count).toEqual(6); // Should be incremented from 5 to 6
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update article in database', async () => {
    // Create test article
    const [createdArticle] = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published,
        like_count: 0 // Start with 0 likes
      })
      .returning()
      .execute();

    await likeArticle(createdArticle.id);

    // Query database to verify the update
    const articles = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, createdArticle.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].like_count).toEqual(1);
    expect(articles[0].updated_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at > createdArticle.updated_at).toBe(true);
  });

  it('should return null for non-existent article', async () => {
    const result = await likeArticle(999);

    expect(result).toBeNull();
  });

  it('should increment from zero correctly', async () => {
    // Create test article with zero likes
    const [createdArticle] = await db.insert(articlesTable)
      .values({
        title: testArticleInput.title,
        content: testArticleInput.content,
        excerpt: testArticleInput.excerpt,
        image_url: testArticleInput.image_url,
        category: testArticleInput.category,
        author: testArticleInput.author,
        is_published: testArticleInput.is_published,
        like_count: 0
      })
      .returning()
      .execute();

    const result = await likeArticle(createdArticle.id);

    expect(result).not.toBeNull();
    expect(result!.like_count).toEqual(1);
  });
});
