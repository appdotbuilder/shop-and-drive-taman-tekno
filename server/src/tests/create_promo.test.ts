
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promosTable } from '../db/schema';
import { type CreatePromoInput } from '../schema';
import { createPromo } from '../handlers/create_promo';
import { eq, gte } from 'drizzle-orm';

// Simple test input
const testInput: CreatePromoInput = {
  title: 'Black Friday Sale',
  description: 'Huge discounts on all products',
  image_url: 'https://example.com/promo.jpg',
  discount_percentage: 25.5,
  start_date: new Date('2024-11-24T00:00:00Z'),
  end_date: new Date('2024-11-30T23:59:59Z'),
  is_active: true
};

const testInputNullDiscount: CreatePromoInput = {
  title: 'Free Shipping Promo',
  description: null,
  image_url: 'https://example.com/shipping.jpg',
  discount_percentage: null,
  start_date: new Date('2024-12-01T00:00:00Z'),
  end_date: new Date('2024-12-15T23:59:59Z'),
  is_active: false
};

describe('createPromo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a promo with discount percentage', async () => {
    const result = await createPromo(testInput);

    // Basic field validation
    expect(result.title).toEqual('Black Friday Sale');
    expect(result.description).toEqual('Huge discounts on all products');
    expect(result.image_url).toEqual('https://example.com/promo.jpg');
    expect(result.discount_percentage).toEqual(25.5);
    expect(typeof result.discount_percentage).toEqual('number');
    expect(result.start_date).toEqual(testInput.start_date);
    expect(result.end_date).toEqual(testInput.end_date);
    expect(result.is_active).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a promo with null discount percentage', async () => {
    const result = await createPromo(testInputNullDiscount);

    expect(result.title).toEqual('Free Shipping Promo');
    expect(result.description).toEqual(null);
    expect(result.discount_percentage).toEqual(null);
    expect(result.is_active).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save promo to database', async () => {
    const result = await createPromo(testInput);

    // Query using proper drizzle syntax
    const promos = await db.select()
      .from(promosTable)
      .where(eq(promosTable.id, result.id))
      .execute();

    expect(promos).toHaveLength(1);
    expect(promos[0].title).toEqual('Black Friday Sale');
    expect(promos[0].description).toEqual('Huge discounts on all products');
    expect(parseFloat(promos[0].discount_percentage!)).toEqual(25.5);
    expect(promos[0].is_active).toEqual(true);
    expect(promos[0].created_at).toBeInstanceOf(Date);
  });

  it('should query promos by date range correctly', async () => {
    // Create test promo
    await createPromo(testInput);

    // Test date filtering with simpler query
    const startDate = new Date('2024-11-20T00:00:00Z');

    const promos = await db.select()
      .from(promosTable)
      .where(gte(promosTable.start_date, startDate))
      .execute();

    expect(promos.length).toBeGreaterThan(0);
    promos.forEach(promo => {
      expect(promo.start_date).toBeInstanceOf(Date);
      expect(promo.start_date >= startDate).toBe(true);
    });
  });
});
