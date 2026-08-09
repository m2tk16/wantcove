import { DeleteCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity } from 'aws-lambda';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createContactMessagesHandler } from './handler';

const guestIdentity = { cognitoIdentityId: 'us-east-1:guest-123' } as AppSyncIdentity;
const adminIdentity = { claims: { 'cognito:groups': ['ADMINS'] } } as unknown as AppSyncIdentity;
const nowMilliseconds = 1_700_000_012_000;
const messageId = '123e4567-e89b-42d3-a456-426614174000';

describe('contact-messages Function', () => {
  beforeEach(() => {
    process.env.CONTACT_MESSAGES_TABLE_NAME = 'ContactTable';
    process.env.CONTACT_MESSAGES_INDEX_NAME = 'byTypeCreatedAt';
  });

  it('rate-limits by server identity then stores a bounded message without the identity or IP', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createContactMessagesHandler(send, () => nowMilliseconds, () => messageId);
    await expect(handler({
      fieldName: 'submitContactMessage',
      identity: guestIdentity,
      arguments: { firstName: ' Martin ', lastName: ' Tulala ', email: ' MARTIN@example.com ', phone: '+1 (615) 555-0100', message: ' Please contact me about this product. ' },
    })).resolves.toBe(true);
    expect(send.mock.calls[0][0]).toBeInstanceOf(UpdateCommand);
    expect(send.mock.calls[1][0]).toBeInstanceOf(PutCommand);
    expect(send.mock.calls[1][0].input).toMatchObject({
      TableName: 'ContactTable',
      Item: {
        id: messageId,
        recordType: 'MESSAGE',
        firstName: 'Martin',
        lastName: 'Tulala',
        email: 'martin@example.com',
        phone: '+1 (615) 555-0100',
        message: 'Please contact me about this product.',
        expiresAt: Math.floor(nowMilliseconds / 1000) + 60 * 60 * 24 * 90,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    });
    expect(send.mock.calls[1][0].input.Item).not.toHaveProperty('actorKey');
    expect(send.mock.calls[1][0].input.Item).not.toHaveProperty('sourceIp');
  });

  it('silently accepts the honeypot after charging the rate limit without storing a message', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createContactMessagesHandler(send, () => nowMilliseconds, () => messageId);
    await expect(handler({ fieldName: 'submitContactMessage', identity: guestIdentity, arguments: { website: 'spam.example' } })).resolves.toBe(true);
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toBeInstanceOf(UpdateCommand);
  });

  it('charges malformed submissions to the rate limit and rejects missing guest identity', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createContactMessagesHandler(send, () => nowMilliseconds, () => messageId);
    await expect(handler({ fieldName: 'submitContactMessage', identity: guestIdentity, arguments: { firstName: 'A' } })).rejects.toThrow('Last name');
    expect(send).toHaveBeenCalledOnce();
    await expect(handler({ fieldName: 'submitContactMessage', arguments: {} })).rejects.toThrow('Unauthorized');
    expect(send).toHaveBeenCalledOnce();
  });

  it('lists only projected messages for an administrator', async () => {
    const send = vi.fn().mockResolvedValue({ Items: [{ id: messageId, firstName: 'A', lastName: 'B', email: 'a@example.com', message: 'Hello there', createdAt: '2026-08-08T12:00:00.000Z', expiresAt: 123, internal: 'secret' }] });
    const handler = createContactMessagesHandler(send);
    await expect(handler({ fieldName: 'listContactMessages', identity: adminIdentity, arguments: {} })).resolves.toEqual([{ id: messageId, firstName: 'A', lastName: 'B', email: 'a@example.com', message: 'Hello there', createdAt: '2026-08-08T12:00:00.000Z' }]);
    expect(send.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
    expect(send.mock.calls[0][0].input).toMatchObject({ IndexName: 'byTypeCreatedAt', ScanIndexForward: false, Limit: 100 });
  });

  it('requires ADMINS and conditionally deletes one validated message', async () => {
    const send = vi.fn().mockResolvedValue({});
    const handler = createContactMessagesHandler(send);
    await expect(handler({ fieldName: 'listContactMessages', identity: guestIdentity, arguments: {} })).rejects.toThrow('Unauthorized');
    await expect(handler({ fieldName: 'deleteContactMessage', identity: adminIdentity, arguments: { id: messageId } })).resolves.toBe(true);
    expect(send.mock.calls[0][0]).toBeInstanceOf(DeleteCommand);
    expect(send.mock.calls[0][0].input).toMatchObject({ Key: { id: messageId }, ConditionExpression: 'recordType = :message' });
  });
});
