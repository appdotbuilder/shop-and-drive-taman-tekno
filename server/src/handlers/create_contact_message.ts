
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput, type ContactMessage } from '../schema';

export const createContactMessage = async (input: CreateContactMessageInput): Promise<ContactMessage> => {
  try {
    // Insert contact message record
    const result = await db.insert(contactMessagesTable)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        is_read: false // Default value for new messages
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Contact message creation failed:', error);
    throw error;
  }
};
