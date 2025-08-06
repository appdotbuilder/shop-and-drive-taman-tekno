
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { serviceBookingsTable } from '../db/schema';
import { type CreateServiceBookingInput } from '../schema';
import { getServiceBookings } from '../handlers/get_service_bookings';
import { eq } from 'drizzle-orm';

// Test booking inputs
const testBooking1: CreateServiceBookingInput = {
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+1234567890',
  service_type: 'Oil Change',
  vehicle_type: 'Sedan',
  preferred_date: new Date('2024-02-01'),
  preferred_time: '10:00 AM',
  notes: 'Regular maintenance'
};

const testBooking2: CreateServiceBookingInput = {
  customer_name: 'Jane Smith',
  customer_email: 'jane@example.com',
  customer_phone: '+0987654321',
  service_type: 'Brake Inspection',
  vehicle_type: null,
  preferred_date: new Date('2024-01-15'),
  preferred_time: '2:00 PM',
  notes: null
};

const testBooking3: CreateServiceBookingInput = {
  customer_name: 'Bob Wilson',
  customer_email: 'bob@example.com',
  customer_phone: '+1122334455',
  service_type: 'Tire Rotation',
  vehicle_type: 'SUV',
  preferred_date: new Date('2024-02-01'),
  preferred_time: '9:00 AM',
  notes: 'Urgent request'
};

describe('getServiceBookings', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no bookings exist', async () => {
    const result = await getServiceBookings();
    expect(result).toEqual([]);
  });

  it('should return all service bookings', async () => {
    // Create test bookings
    await db.insert(serviceBookingsTable)
      .values([
        {
          ...testBooking1,
          preferred_date: testBooking1.preferred_date
        },
        {
          ...testBooking2,
          preferred_date: testBooking2.preferred_date
        }
      ])
      .execute();

    const result = await getServiceBookings();

    expect(result).toHaveLength(2);
    
    // Verify first booking
    expect(result.some(booking => 
      booking.customer_name === 'John Doe' &&
      booking.customer_email === 'john@example.com' &&
      booking.service_type === 'Oil Change' &&
      booking.vehicle_type === 'Sedan'
    )).toBe(true);

    // Verify second booking
    expect(result.some(booking => 
      booking.customer_name === 'Jane Smith' &&
      booking.customer_email === 'jane@example.com' &&
      booking.service_type === 'Brake Inspection' &&
      booking.vehicle_type === null
    )).toBe(true);

    // Verify all bookings have required fields
    result.forEach(booking => {
      expect(booking.id).toBeDefined();
      expect(booking.customer_name).toBeDefined();
      expect(booking.customer_email).toBeDefined();
      expect(booking.customer_phone).toBeDefined();
      expect(booking.service_type).toBeDefined();
      expect(booking.preferred_date).toBeInstanceOf(Date);
      expect(booking.preferred_time).toBeDefined();
      expect(booking.status).toBeDefined();
      expect(booking.created_at).toBeInstanceOf(Date);
      expect(booking.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should order bookings by preferred date ascending, then by created_at descending', async () => {
    // Create bookings with different dates
    const booking1Result = await db.insert(serviceBookingsTable)
      .values({
        ...testBooking2,
        preferred_date: testBooking2.preferred_date // 2024-01-15 (earlier)
      })
      .returning()
      .execute();

    // Wait a bit to ensure different created_at times
    await new Promise(resolve => setTimeout(resolve, 10));

    const booking2Result = await db.insert(serviceBookingsTable)
      .values({
        ...testBooking1,
        preferred_date: testBooking1.preferred_date // 2024-02-01 (later)
      })
      .returning()
      .execute();

    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 10));

    const booking3Result = await db.insert(serviceBookingsTable)
      .values({
        ...testBooking3,
        preferred_date: testBooking3.preferred_date // 2024-02-01 (same as booking2, but created later)
      })
      .returning()
      .execute();

    const result = await getServiceBookings();

    expect(result).toHaveLength(3);

    // First should be the earliest preferred date
    expect(result[0].preferred_date.toISOString().split('T')[0]).toBe('2024-01-15');
    expect(result[0].customer_name).toBe('Jane Smith');

    // Next two should be same date but ordered by created_at desc (newest first)
    expect(result[1].preferred_date.toISOString().split('T')[0]).toBe('2024-02-01');
    expect(result[2].preferred_date.toISOString().split('T')[0]).toBe('2024-02-01');
    
    // The one created later should come first
    expect(result[1].customer_name).toBe('Bob Wilson');
    expect(result[2].customer_name).toBe('John Doe');
  });

  it('should handle different booking statuses correctly', async () => {
    // Create booking and then update its status
    const bookingResult = await db.insert(serviceBookingsTable)
      .values({
        ...testBooking1,
        preferred_date: testBooking1.preferred_date
      })
      .returning()
      .execute();

    // Update status to confirmed
    await db.update(serviceBookingsTable)
      .set({ status: 'confirmed' })
      .where(eq(serviceBookingsTable.id, bookingResult[0].id))
      .execute();

    const result = await getServiceBookings();

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('confirmed');
    expect(result[0].customer_name).toBe('John Doe');
  });
});
