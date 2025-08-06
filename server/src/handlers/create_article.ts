
import { db } from '../db';
import { articlesTable } from '../db/schema';
import { type CreateArticleInput, type Article } from '../schema';

export const createArticle = async (input: CreateArticleInput): Promise<Article> => {
  try {
    // Insert article record
    const result = await db.insert(articlesTable)
      .values({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        image_url: input.image_url,
        category: input.category,
        author: input.author,
        is_published: input.is_published
      })
      .returning()
      .execute();

    // Return the created article (no numeric conversions needed for this table)
    const article = result[0];
    return article;
  } catch (error) {
    console.error('Article creation failed:', error);
    throw error;
  }
};
