
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promosTable } from '../db/schema';
import { type CreatePromoInput } from '../schema';
import { getPromos } from '../handlers/get_promos';

const testPromo1: CreatePromoInput = {
  title: 'Summer Sale',
  description: 'Hot summer deals on all products',
  image_url: 'https://example.com/summer.jpg',
  discount_percentage: 25,
  start_date: new Date('2024-06-01'),
  end_date: new Date('2024-08-31'),
  is_active: true
};

const testPromo2: CreatePromoInput = {
  title: 'Winter Clearance',
  description: 'End of winter clearance sale',
  image_url: 'https://example.com/winter.jpg',
  discount_percentage: 50,
  start_date: new Date('2024-01-01'),
  end_date: new Date('2024-02-29'),
  is_active: false
};

const testPromo3: CreatePromoInput = {
  title: 'Free Shipping',
  description: null,
  image_url: 'https://example.com/shipping.jpg',
  discount_percentage: null,
  start_date: new Date('2024-03-01'),
  end_date: new Date('2024-12-31'),
  is_active: true
};

describe('getPromos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no promos exist', async () => {
    const result = await getPromos();

    expect(result).toEqual([]);
  });

  it('should return all promos with correct field types', async () => {
    // Insert test promos
    await db.insert(promosTable).values([
      {
        ...testPromo1,
        discount_percentage: testPromo1.discount_percentage?.toString()
      },
      {
        ...testPromo2,
        discount_percentage: testPromo2.discount_percentage?.toString()
      }
    ]);

    const result = await getPromos();

    expect(result).toHaveLength(2);

    // Check first promo
    const promo1 = result.find(p => p.title === 'Summer Sale');
    expect(promo1).toBeDefined();
    expect(promo1!.title).toEqual('Summer Sale');
    expect(promo1!.description).toEqual('Hot summer deals on all products');
    expect(promo1!.image_url).toEqual('https://example.com/summer.jpg');
    expect(promo1!.discount_percentage).toEqual(25);
    expect(typeof promo1!.discount_percentage).toBe('number');
    expect(promo1!.is_active).toBe(true);
    expect(promo1!.id).toBeDefined();
    expect(promo1!.created_at).toBeInstanceOf(Date);
    expect(promo1!.updated_at).toBeInstanceOf(Date);

    // Check second promo
    const promo2 = result.find(p => p.title === 'Winter Clearance');
    expect(promo2).toBeDefined();
    expect(promo2!.discount_percentage).toEqual(50);
    expect(typeof promo2!.discount_percentage).toBe('number');
    expect(promo2!.is_active).toBe(false);
  });

  it('should handle null discount_percentage correctly', async () => {
    await db.insert(promosTable).values({
      ...testPromo3,
      discount_percentage: null
    });

    const result = await getPromos();

    expect(result).toHaveLength(1);
    expect(result[0].discount_percentage).toBeNull();
    expect(result[0].description).toBeNull();
  });

  it('should order promos by active status first, then by creation date descending', async () => {
    // Insert promos with slight delay to ensure different created_at timestamps
    await db.insert(promosTable).values({
      ...testPromo2,
      discount_percentage: testPromo2.discount_percentage?.toString()
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(promosTable).values({
      ...testPromo1,
      discount_percentage: testPromo1.discount_percentage?.toString()
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(promosTable).values({
      ...testPromo3,
      discount_percentage: null
    });

    const result = await getPromos();

    expect(result).toHaveLength(3);

    // Active promos should come first
    expect(result[0].is_active).toBe(true);
    expect(result[1].is_active).toBe(true);
    expect(result[2].is_active).toBe(false);

    // Among active promos, newer should come first
    expect(result[0].title).toEqual('Free Shipping'); // Most recent active
    expect(result[1].title).toEqual('Summer Sale'); // Second most recent active
    expect(result[2].title).toEqual('Winter Clearance'); // Inactive promo
  });
});
