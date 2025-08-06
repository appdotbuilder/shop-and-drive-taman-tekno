
import { db } from '../db';
import { serviceBookingsTable } from '../db/schema';
import { type CreateServiceBookingInput, type ServiceBooking } from '../schema';

export const createServiceBooking = async (input: CreateServiceBookingInput): Promise<ServiceBooking> => {
  try {
    // Insert service booking record
    const result = await db.insert(serviceBookingsTable)
      .values({
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        service_type: input.service_type,
        vehicle_type: input.vehicle_type,
        preferred_date: input.preferred_date,
        preferred_time: input.preferred_time,
        notes: input.notes,
        status: 'pending' // Default status from schema
      })
      .returning()
      .execute();

    const booking = result[0];
    return {
      ...booking,
      status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled'
    };
  } catch (error) {
    console.error('Service booking creation failed:', error);
    throw error;
  }
};
