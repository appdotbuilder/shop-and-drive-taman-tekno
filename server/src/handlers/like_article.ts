
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type Article } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const likeArticle = async (id: number): Promise<Article | null> => {
  try {
    // Update the article's like_count by incrementing it
    const result = await db
      .update(articlesTable)
      .set({
        like_count: sql`${articlesTable.like_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(articlesTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    const article = result[0];
    
    // Return the article (no numeric conversions needed for articles table)
    return article;
  } catch (error) {
    console.error('Article like failed:', error);
    throw error;
  }
};
