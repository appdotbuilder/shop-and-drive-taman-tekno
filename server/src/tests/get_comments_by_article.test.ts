
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articlesTable, commentsTable } from '../db/schema';
import { type CreateArticleInput, type CreateCommentInput } from '../schema';
import { getCommentsByArticle } from '../handlers/get_comments_by_article';

// Test data
const testArticle: CreateArticleInput = {
  title: 'Test Article',
  content: 'This is a test article content',
  excerpt: 'Test excerpt',
  image_url: 'https://example.com/image.jpg',
  category: 'Technology',
  author: 'Test Author',
  is_published: true
};

const testComment1: CreateCommentInput = {
  article_id: 1, // Will be set properly in tests
  author_name: 'John Doe',
  author_email: 'john@example.com',
  content: 'Great article!'
};

const testComment2: CreateCommentInput = {
  article_id: 1, // Will be set properly in tests
  author_name: 'Jane Smith',
  author_email: 'jane@example.com',
  content: 'Very informative, thanks!'
};

describe('getCommentsByArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return approved comments for a specific article', async () => {
    // Create article first
    const articleResult = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();
    
    const articleId = articleResult[0].id;

    // Create approved comments
    await db.insert(commentsTable)
      .values([
        {
          ...testComment1,
          article_id: articleId,
          is_approved: true
        },
        {
          ...testComment2,
          article_id: articleId,
          is_approved: true
        }
      ])
      .execute();

    const result = await getCommentsByArticle(articleId);

    expect(result).toHaveLength(2);
    expect(result[0].article_id).toEqual(articleId);
    expect(result[0].author_name).toEqual('John Doe');
    expect(result[0].content).toEqual('Great article!');
    expect(result[0].is_approved).toBe(true);
    expect(result[1].article_id).toEqual(articleId);
    expect(result[1].author_name).toEqual('Jane Smith');
    expect(result[1].content).toEqual('Very informative, thanks!');
    expect(result[1].is_approved).toBe(true);
  });

  it('should not return unapproved comments', async () => {
    // Create article first
    const articleResult = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();
    
    const articleId = articleResult[0].id;

    // Create mix of approved and unapproved comments
    await db.insert(commentsTable)
      .values([
        {
          ...testComment1,
          article_id: articleId,
          is_approved: true
        },
        {
          ...testComment2,
          article_id: articleId,
          is_approved: false // This should not be returned
        }
      ])
      .execute();

    const result = await getCommentsByArticle(articleId);

    expect(result).toHaveLength(1);
    expect(result[0].author_name).toEqual('John Doe');
    expect(result[0].is_approved).toBe(true);
  });

  it('should return comments ordered by creation date (oldest first)', async () => {
    // Create article first
    const articleResult = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();
    
    const articleId = articleResult[0].id;

    // Create comments with slight delay to ensure different timestamps
    const firstComment = await db.insert(commentsTable)
      .values({
        ...testComment1,
        article_id: articleId,
        is_approved: true
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondComment = await db.insert(commentsTable)
      .values({
        ...testComment2,
        article_id: articleId,
        is_approved: true
      })
      .returning()
      .execute();

    const result = await getCommentsByArticle(articleId);

    expect(result).toHaveLength(2);
    // First comment should come first (oldest)
    expect(result[0].id).toEqual(firstComment[0].id);
    expect(result[1].id).toEqual(secondComment[0].id);
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });

  it('should return empty array for non-existent article', async () => {
    const result = await getCommentsByArticle(999);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for article with no approved comments', async () => {
    // Create article first
    const articleResult = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();
    
    const articleId = articleResult[0].id;

    // Create only unapproved comments
    await db.insert(commentsTable)
      .values({
        ...testComment1,
        article_id: articleId,
        is_approved: false
      })
      .execute();

    const result = await getCommentsByArticle(articleId);

    expect(result).toHaveLength(0);
  });

  it('should not return comments from other articles', async () => {
    // Create two articles
    const article1Result = await db.insert(articlesTable)
      .values(testArticle)
      .returning()
      .execute();
    
    const article2Result = await db.insert(articlesTable)
      .values({
        ...testArticle,
        title: 'Second Article'
      })
      .returning()
      .execute();
    
    const article1Id = article1Result[0].id;
    const article2Id = article2Result[0].id;

    // Create comments for both articles
    await db.insert(commentsTable)
      .values([
        {
          ...testComment1,
          article_id: article1Id,
          is_approved: true
        },
        {
          ...testComment2,
          article_id: article2Id,
          is_approved: true
        }
      ])
      .execute();

    const result = await getCommentsByArticle(article1Id);

    expect(result).toHaveLength(1);
    expect(result[0].article_id).toEqual(article1Id);
    expect(result[0].author_name).toEqual('John Doe');
  });
});
