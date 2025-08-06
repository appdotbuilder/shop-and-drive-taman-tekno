
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type Article } from '../schema';
import { desc, eq } from 'drizzle-orm';

export const getArticles = async (): Promise<Article[]> => {
  try {
    const results = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.is_published, true))
      .orderBy(desc(articlesTable.created_at))
      .execute();

    // No numeric conversions needed for articles - all numeric fields are integers
    return results;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    throw error;
  }
};
