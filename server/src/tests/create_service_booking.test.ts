
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { serviceBookingsTable } from '../db/schema';
import { type CreateServiceBookingInput } from '../schema';
import { createServiceBooking } from '../handlers/create_service_booking';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateServiceBookingInput = {
  customer_name: 'John Doe',
  customer_email: 'john@example.com',
  customer_phone: '+1234567890',
  service_type: 'Oil Change',
  vehicle_type: 'Sedan',
  preferred_date: new Date('2024-01-15'),
  preferred_time: '10:00 AM',
  notes: 'Please call before arrival'
};

describe('createServiceBooking', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a service booking', async () => {
    const result = await createServiceBooking(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_email).toEqual('john@example.com');
    expect(result.customer_phone).toEqual('+1234567890');
    expect(result.service_type).toEqual('Oil Change');
    expect(result.vehicle_type).toEqual('Sedan');
    expect(result.preferred_date).toEqual(new Date('2024-01-15'));
    expect(result.preferred_time).toEqual('10:00 AM');
    expect(result.notes).toEqual('Please call before arrival');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save service booking to database', async () => {
    const result = await createServiceBooking(testInput);

    // Query using proper drizzle syntax
    const bookings = await db.select()
      .from(serviceBookingsTable)
      .where(eq(serviceBookingsTable.id, result.id))
      .execute();

    expect(bookings).toHaveLength(1);
    expect(bookings[0].customer_name).toEqual('John Doe');
    expect(bookings[0].customer_email).toEqual('john@example.com');
    expect(bookings[0].service_type).toEqual('Oil Change');
    expect(bookings[0].status).toEqual('pending');
    expect(bookings[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle booking with minimal required fields', async () => {
    const minimalInput: CreateServiceBookingInput = {
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      customer_phone: '+9876543210',
      service_type: 'Car Wash',
      vehicle_type: null,
      preferred_date: new Date('2024-02-01'),
      preferred_time: '2:00 PM',
      notes: null
    };

    const result = await createServiceBooking(minimalInput);

    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.customer_email).toEqual('jane@example.com');
    expect(result.service_type).toEqual('Car Wash');
    expect(result.vehicle_type).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
  });

  it('should set default status to pending', async () => {
    const result = await createServiceBooking(testInput);

    expect(result.status).toEqual('pending');

    // Verify in database
    const bookings = await db.select()
      .from(serviceBookingsTable)
      .where(eq(serviceBookingsTable.id, result.id))
      .execute();

    expect(bookings[0].status).toEqual('pending');
  });
});
