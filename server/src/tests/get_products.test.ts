
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { getProducts } from '../handlers/get_products';

// Test product inputs
const testProduct1: CreateProductInput = {
  name: 'Product A',
  description: 'Description A',
  price: 19.99,
  image_url: 'https://example.com/product-a.jpg',
  category: 'Electronics',
  stock_quantity: 100,
  is_available: true
};

const testProduct2: CreateProductInput = {
  name: 'Product B',
  description: 'Description B',
  price: 29.99,
  image_url: 'https://example.com/product-b.jpg',
  category: 'Automotive',
  stock_quantity: 50,
  is_available: false
};

const testProduct3: CreateProductInput = {
  name: 'Product C',
  description: null,
  price: 39.99,
  image_url: 'https://example.com/product-c.jpg',
  category: 'Electronics',
  stock_quantity: 0,
  is_available: true
};

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();
    expect(result).toHaveLength(0);
    expect(result).toBeInstanceOf(Array);
  });

  it('should return all products with proper type conversions', async () => {
    // Create test products
    await db.insert(productsTable).values([
      {
        ...testProduct1,
        price: testProduct1.price.toString()
      },
      {
        ...testProduct2,
        price: testProduct2.price.toString()
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    
    // Verify type conversions
    result.forEach(product => {
      expect(typeof product.price).toBe('number');
      expect(product.id).toBeDefined();
      expect(product.created_at).toBeInstanceOf(Date);
      expect(product.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should order products by category then availability', async () => {
    // Create test products in different order
    await db.insert(productsTable).values([
      {
        ...testProduct1, // Electronics, available
        price: testProduct1.price.toString()
      },
      {
        ...testProduct2, // Automotive, not available
        price: testProduct2.price.toString()
      },
      {
        ...testProduct3, // Electronics, available
        price: testProduct3.price.toString()
      }
    ]).execute();

    const result = await getProducts();

    expect(result).toHaveLength(3);
    
    // Should be ordered by category (Automotive, Electronics), then by availability (false, true)
    expect(result[0].category).toBe('Automotive');
    expect(result[0].is_available).toBe(false);
    
    expect(result[1].category).toBe('Electronics');
    expect(result[1].is_available).toBe(true);
    
    expect(result[2].category).toBe('Electronics');
    expect(result[2].is_available).toBe(true);
  });

  it('should handle nullable fields correctly', async () => {
    await db.insert(productsTable).values({
      ...testProduct3,
      price: testProduct3.price.toString()
    }).execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
    expect(result[0].name).toBe('Product C');
    expect(result[0].price).toBe(39.99);
  });
});
