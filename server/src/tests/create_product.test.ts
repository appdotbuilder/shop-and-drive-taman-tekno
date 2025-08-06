
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

// Simple test input with all required fields
const testInput: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 19.99,
  image_url: 'https://example.com/image.jpg',
  category: 'Electronics',
  stock_quantity: 100,
  is_available: true
};

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with all fields', async () => {
    const result = await createProduct(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Product');
    expect(result.description).toEqual('A product for testing');
    expect(result.price).toEqual(19.99);
    expect(typeof result.price).toBe('number'); // Verify numeric conversion
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.category).toEqual('Electronics');
    expect(result.stock_quantity).toEqual(100);
    expect(result.is_available).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save product to database', async () => {
    const result = await createProduct(testInput);

    // Query using proper drizzle syntax
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Test Product');
    expect(products[0].description).toEqual('A product for testing');
    expect(parseFloat(products[0].price)).toEqual(19.99); // Price stored as string, convert back
    expect(products[0].image_url).toEqual('https://example.com/image.jpg');
    expect(products[0].category).toEqual('Electronics');
    expect(products[0].stock_quantity).toEqual(100);
    expect(products[0].is_available).toEqual(true);
    expect(products[0].created_at).toBeInstanceOf(Date);
    expect(products[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create product with nullable description', async () => {
    const inputWithNullDescription: CreateProductInput = {
      ...testInput,
      description: null
    };

    const result = await createProduct(inputWithNullDescription);

    expect(result.description).toBeNull();
    expect(result.name).toEqual('Test Product');
    expect(result.price).toEqual(19.99);
  });

  it('should create product with default is_available when not provided', async () => {
    // Test with is_available field using Zod default
    const inputWithDefaults = {
      name: 'Default Product',
      description: 'Testing defaults',
      price: 29.99,
      image_url: 'https://example.com/default.jpg',
      category: 'Default Category',
      stock_quantity: 50
      // is_available omitted - should use Zod default (true)
    };

    const result = await createProduct(inputWithDefaults as CreateProductInput);

    expect(result.is_available).toEqual(true);
    expect(result.name).toEqual('Default Product');
    expect(result.stock_quantity).toEqual(50);
  });

  it('should handle zero stock quantity', async () => {
    const inputWithZeroStock: CreateProductInput = {
      ...testInput,
      stock_quantity: 0
    };

    const result = await createProduct(inputWithZeroStock);

    expect(result.stock_quantity).toEqual(0);
    expect(result.name).toEqual('Test Product');
  });
});
