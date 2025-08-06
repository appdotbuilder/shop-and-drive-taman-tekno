
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { getProductById } from '../handlers/get_product_by_id';

const testProduct: CreateProductInput = {
  name: 'Test Product',
  description: 'A product for testing',
  price: 29.99,
  image_url: 'https://example.com/product.jpg',
  category: 'Electronics',
  stock_quantity: 50,
  is_available: true
};

describe('getProductById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a product when it exists', async () => {
    // Create a product first
    const [created] = await db.insert(productsTable)
      .values({
        name: testProduct.name,
        description: testProduct.description,
        price: testProduct.price.toString(),
        image_url: testProduct.image_url,
        category: testProduct.category,
        stock_quantity: testProduct.stock_quantity,
        is_available: testProduct.is_available
      })
      .returning()
      .execute();

    const result = await getProductById(created.id);

    expect(result).not.toBeNull();
    expect(result?.id).toEqual(created.id);
    expect(result?.name).toEqual('Test Product');
    expect(result?.description).toEqual(testProduct.description);
    expect(result?.price).toEqual(29.99);
    expect(typeof result?.price).toBe('number');
    expect(result?.image_url).toEqual(testProduct.image_url);
    expect(result?.category).toEqual('Electronics');
    expect(result?.stock_quantity).toEqual(50);
    expect(result?.is_available).toEqual(true);
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when product does not exist', async () => {
    const result = await getProductById(999);
    expect(result).toBeNull();
  });

  it('should handle numeric price conversion correctly', async () => {
    // Create a product with decimal price
    const [created] = await db.insert(productsTable)
      .values({
        name: 'Price Test Product',
        description: 'Testing price conversion',
        price: '123.45',
        image_url: 'https://example.com/price-test.jpg',
        category: 'Test',
        stock_quantity: 10,
        is_available: true
      })
      .returning()
      .execute();

    const result = await getProductById(created.id);

    expect(result).not.toBeNull();
    expect(result?.price).toEqual(123.45);
    expect(typeof result?.price).toBe('number');
  });
});
