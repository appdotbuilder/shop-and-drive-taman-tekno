
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type CreateArticleInput } from '../schema';
import { getArticles } from '../handlers/get_articles';

// Test article data
const testArticle1: CreateArticleInput = {
  title: 'First Test Article',
  content: 'This is the content of the first test article.',
  excerpt: 'First excerpt',
  image_url: 'https://example.com/image1.jpg',
  category: 'Technology',
  author: 'John Doe',
  is_published: true
};

const testArticle2: CreateArticleInput = {
  title: 'Second Test Article', 
  content: 'This is the content of the second test article.',
  excerpt: 'Second excerpt',
  image_url: 'https://example.com/image2.jpg',
  category: 'Science',
  author: 'Jane Smith',
  is_published: true
};

const unpublishedArticle: CreateArticleInput = {
  title: 'Unpublished Article',
  content: 'This article is not published.',
  excerpt: 'Unpublished excerpt',
  image_url: 'https://example.com/image3.jpg',
  category: 'Draft',
  author: 'Bob Wilson',
  is_published: false
};

describe('getArticles', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no articles exist', async () => {
    const result = await getArticles();
    expect(result).toEqual([]);
  });

  it('should return published articles ordered by creation date', async () => {
    // Insert test articles with slight delay to ensure different timestamps
    await db.insert(articlesTable).values(testArticle1).execute();
    
    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(articlesTable).values(testArticle2).execute();

    const result = await getArticles();

    expect(result).toHaveLength(2);
    
    // Verify first article (newest)
    expect(result[0].title).toEqual('Second Test Article');
    expect(result[0].content).toEqual(testArticle2.content);
    expect(result[0].category).toEqual('Science');
    expect(result[0].author).toEqual('Jane Smith');
    expect(result[0].is_published).toBe(true);
    expect(result[0].like_count).toBe(0);
    expect(result[0].view_count).toBe(0);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    // Verify second article (older)
    expect(result[1].title).toEqual('First Test Article');
    expect(result[1].content).toEqual(testArticle1.content);
    expect(result[1].category).toEqual('Technology');
    expect(result[1].author).toEqual('John Doe');
    expect(result[1].is_published).toBe(true);
    
    // Verify ordering - newer article should have later timestamp
    expect(result[0].created_at > result[1].created_at).toBe(true);
  });

  it('should only return published articles', async () => {
    // Insert both published and unpublished articles
    await db.insert(articlesTable).values(testArticle1).execute();
    await db.insert(articlesTable).values(unpublishedArticle).execute();

    const result = await getArticles();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('First Test Article');
    expect(result[0].is_published).toBe(true);
  });

  it('should handle articles with null optional fields', async () => {
    const articleWithNulls: CreateArticleInput = {
      title: 'Article with Nulls',
      content: 'Content here',
      excerpt: null,
      image_url: null,
      category: 'General',
      author: 'Test Author',
      is_published: true
    };

    await db.insert(articlesTable).values(articleWithNulls).execute();

    const result = await getArticles();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Article with Nulls');
    expect(result[0].excerpt).toBeNull();
    expect(result[0].image_url).toBeNull();
    expect(result[0].content).toEqual('Content here');
    expect(result[0].category).toEqual('General');
  });
});
