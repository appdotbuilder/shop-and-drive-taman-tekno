
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactMessagesTable } from '../db/schema';
import { type CreateContactMessageInput } from '../schema';
import { createContactMessage } from '../handlers/create_contact_message';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateContactMessageInput = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  subject: 'Test Subject',
  message: 'This is a test message for contact form submission.'
};

const testInputWithoutPhone: CreateContactMessageInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  phone: null,
  subject: 'Another Test',
  message: 'Test message without phone number.'
};

describe('createContactMessage', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact message with all fields', async () => {
    const result = await createContactMessage(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.phone).toEqual('+1234567890');
    expect(result.subject).toEqual('Test Subject');
    expect(result.message).toEqual('This is a test message for contact form submission.');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a contact message without phone number', async () => {
    const result = await createContactMessage(testInputWithoutPhone);

    expect(result.name).toEqual('Jane Smith');
    expect(result.email).toEqual('jane.smith@example.com');
    expect(result.phone).toBeNull();
    expect(result.subject).toEqual('Another Test');
    expect(result.message).toEqual('Test message without phone number.');
    expect(result.is_read).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save contact message to database', async () => {
    const result = await createContactMessage(testInput);

    // Query database to verify the record was saved
    const messages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(messages).toHaveLength(1);
    const savedMessage = messages[0];
    expect(savedMessage.name).toEqual('John Doe');
    expect(savedMessage.email).toEqual('john.doe@example.com');
    expect(savedMessage.phone).toEqual('+1234567890');
    expect(savedMessage.subject).toEqual('Test Subject');
    expect(savedMessage.message).toEqual('This is a test message for contact form submission.');
    expect(savedMessage.is_read).toEqual(false);
    expect(savedMessage.created_at).toBeInstanceOf(Date);
  });

  it('should set default is_read to false', async () => {
    const result = await createContactMessage(testInput);

    expect(result.is_read).toEqual(false);

    // Verify in database
    const messages = await db.select()
      .from(contactMessagesTable)
      .where(eq(contactMessagesTable.id, result.id))
      .execute();

    expect(messages[0].is_read).toEqual(false);
  });
});
