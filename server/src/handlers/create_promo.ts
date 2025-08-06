
import { db } from '../db';
import { promosTable } from '../db/schema';
import { type CreatePromoInput, type Promo } from '../schema';

export const createPromo = async (input: CreatePromoInput): Promise<Promo> => {
  try {
    // Insert promo record
    const result = await db.insert(promosTable)
      .values({
        title: input.title,
        description: input.description,
        image_url: input.image_url,
        discount_percentage: input.discount_percentage?.toString(), // Convert number to string for numeric column
        start_date: input.start_date,
        end_date: input.end_date,
        is_active: input.is_active
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const promo = result[0];
    return {
      ...promo,
      discount_percentage: promo.discount_percentage ? parseFloat(promo.discount_percentage) : null
    };
  } catch (error) {
    console.error('Promo creation failed:', error);
    throw error;
  }
};
