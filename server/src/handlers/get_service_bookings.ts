
import { db } from '../db';
import { serviceBookingsTable } from '../db/schema';
import { type ServiceBooking } from '../schema';
import { asc, desc } from 'drizzle-orm';

export const getServiceBookings = async (): Promise<ServiceBooking[]> => {
  try {
    const results = await db.select()
      .from(serviceBookingsTable)
      .orderBy(asc(serviceBookingsTable.preferred_date), desc(serviceBookingsTable.created_at))
      .execute();

    // Convert numeric fields if any (none in this table, but following the pattern)
    return results.map(booking => ({
      ...booking,
      // All fields are already in the correct type, no numeric conversions needed
    }));
  } catch (error) {
    console.error('Service bookings retrieval failed:', error);
    throw error;
  }
};
