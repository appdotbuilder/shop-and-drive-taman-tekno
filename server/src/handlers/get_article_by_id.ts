
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type Article } from '../schema';
import { eq } from 'drizzle-orm';

export const getArticleById = async (id: number): Promise<Article | null> => {
  try {
    // First, get the article
    const articles = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))
      .execute();

    if (articles.length === 0) {
      return null;
    }

    const article = articles[0];

    // Increment view count
    await db.update(articlesTable)
      .set({ view_count: article.view_count + 1 })
      .where(eq(articlesTable.id, id))
      .execute();

    // Return the article with incremented view count
    return {
      ...article,
      view_count: article.view_count + 1
    };
  } catch (error) {
    console.error('Failed to get article by ID:', error);
    throw error;
  }
};
