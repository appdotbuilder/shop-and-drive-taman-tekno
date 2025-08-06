
import { db } from '../db';
import { promosTable } from '../db/schema';
import { desc } from 'drizzle-orm';
import { type Promo } from '../schema';

export const getPromos = async (): Promise<Promo[]> => {
  try {
    const results = await db.select()
      .from(promosTable)
      .orderBy(desc(promosTable.is_active), desc(promosTable.created_at))
      .execute();

    // Convert numeric fields back to numbers before returning
    return results.map(promo => ({
      ...promo,
      discount_percentage: promo.discount_percentage ? parseFloat(promo.discount_percentage) : null
    }));
  } catch (error) {
    console.error('Failed to fetch promos:', error);
    throw error;
  }
};
