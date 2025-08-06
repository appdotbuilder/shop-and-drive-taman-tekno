
import { db } from '../db';
import { commentsTable, articlesTable } from '../db/schema';
import { type CreateCommentInput, type Comment } from '../schema';
import { eq } from 'drizzle-orm';

export const createComment = async (input: CreateCommentInput): Promise<Comment> => {
  try {
    // Verify article exists first to prevent foreign key constraint violation
    const existingArticle = await db.select()
      .from(articlesTable)
      .where(eq(articlesTable.id, input.article_id))
      .execute();

    if (existingArticle.length === 0) {
      throw new Error(`Article with id ${input.article_id} not found`);
    }

    // Insert comment record
    const result = await db.insert(commentsTable)
      .values({
        article_id: input.article_id,
        author_name: input.author_name,
        author_email: input.author_email,
        content: input.content,
        is_approved: false // Comments need approval by default
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Comment creation failed:', error);
    throw error;
  }
};
