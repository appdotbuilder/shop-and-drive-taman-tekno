
import { db } from '../db';
import { commentsTable } from '../db/schema';
import { type Comment } from '../schema';
import { eq, and, asc } from 'drizzle-orm';

export const getCommentsByArticle = async (articleId: number): Promise<Comment[]> => {
  try {
    // Query for approved comments for the specific article, ordered by creation date (oldest first)
    const results = await db.select()
      .from(commentsTable)
      .where(and(
        eq(commentsTable.article_id, articleId),
        eq(commentsTable.is_approved, true)
      ))
      .orderBy(asc(commentsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get comments by article failed:', error);
    throw error;
  }
};
