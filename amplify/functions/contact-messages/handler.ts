import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { AppSyncIdentity, AppSyncResolverHandler } from 'aws-lambda';
import { enforceContactRateLimit } from './abuse-controls';

const CONTACT_MESSAGE_TTL_SECONDS = 60 * 60 * 24 * 90;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+().\-\s]{7,30}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

type ContactArguments = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
  website?: string;
};

type ContactEvent = {
  arguments: ContactArguments;
  fieldName?: string;
  info?: { fieldName?: string };
  identity?: AppSyncIdentity;
};

type CommandResult = { Items?: Record<string, unknown>[] };
type SendCommand = (command: object) => Promise<CommandResult>;

function requireTableName() {
  const value = process.env.CONTACT_MESSAGES_TABLE_NAME;
  if (!value) throw new Error('Contact message storage is not configured.');
  return value;
}

function requireIndexName() {
  const value = process.env.CONTACT_MESSAGES_INDEX_NAME;
  if (!value) throw new Error('Contact message index is not configured.');
  return value;
}

function requireActorKey(identity: AppSyncIdentity | undefined) {
  if (!identity || !('cognitoIdentityId' in identity) || !identity.cognitoIdentityId) throw new Error('Unauthorized');
  return identity.cognitoIdentityId;
}

function requireAdmin(identity: AppSyncIdentity | undefined) {
  if (!identity || !('claims' in identity)) throw new Error('Unauthorized');
  const claim = identity.claims?.['cognito:groups'];
  const groups = Array.isArray(claim)
    ? claim
    : typeof claim === 'string'
      ? claim.replace(/^\[|\]$/g, '').split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
      : [];
  if (!groups.includes('ADMINS')) throw new Error('Unauthorized');
}

function requireSingleLine(value: string | undefined, label: string, min: number, max: number) {
  const normalized = value?.trim() ?? '';
  if (normalized.length < min || normalized.length > max || /[\r\n\0]/.test(normalized)) {
    throw new Error(`${label} must be between ${min} and ${max} characters on one line.`);
  }
  return normalized;
}

function requireMessage(value: string | undefined) {
  const normalized = value?.trim() ?? '';
  if (normalized.length < 10 || normalized.length > 2_000 || normalized.includes('\0')) {
    throw new Error('Message must be between 10 and 2000 characters.');
  }
  return normalized;
}

function requireEmail(value: string | undefined) {
  const normalized = value?.trim().toLocaleLowerCase() ?? '';
  if (normalized.length > 254 || !EMAIL_PATTERN.test(normalized)) throw new Error('Enter a valid email address.');
  return normalized;
}

function optionalPhone(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const normalized = value.trim();
  if (!PHONE_PATTERN.test(normalized)) throw new Error('Enter a valid phone number or leave it blank.');
  return normalized;
}

function publicContactMessage(item: Record<string, unknown>) {
  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    email: item.email,
    ...(typeof item.phone === 'string' ? { phone: item.phone } : {}),
    message: item.message,
    createdAt: item.createdAt,
  };
}

export function createContactMessagesHandler(send: SendCommand, now = () => Date.now(), createId = randomUUID) {
  return async (event: ContactEvent): Promise<unknown> => {
    const TableName = requireTableName();
    const fieldName = event.fieldName ?? event.info?.fieldName;

    if (fieldName === 'submitContactMessage') {
      const actorKey = requireActorKey(event.identity);
      const nowMilliseconds = now();
      const nowSeconds = Math.floor(nowMilliseconds / 1000);
      await enforceContactRateLimit({ send, tableName: TableName, actorKey, nowSeconds });
      if (event.arguments.website?.trim()) return true;

      const createdAt = new Date(nowMilliseconds).toISOString();
      const phone = optionalPhone(event.arguments.phone);
      await send(new PutCommand({
        TableName,
        Item: {
          id: createId(),
          recordType: 'MESSAGE',
          firstName: requireSingleLine(event.arguments.firstName, 'First name', 1, 80),
          lastName: requireSingleLine(event.arguments.lastName, 'Last name', 1, 80),
          email: requireEmail(event.arguments.email),
          ...(phone ? { phone } : {}),
          message: requireMessage(event.arguments.message),
          createdAt,
          expiresAt: nowSeconds + CONTACT_MESSAGE_TTL_SECONDS,
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }));
      return true;
    }

    requireAdmin(event.identity);
    if (fieldName === 'listContactMessages') {
      const result = await send(new QueryCommand({
        TableName,
        IndexName: requireIndexName(),
        KeyConditionExpression: '#recordType = :message',
        ExpressionAttributeNames: { '#recordType': 'recordType' },
        ExpressionAttributeValues: { ':message': 'MESSAGE' },
        ScanIndexForward: false,
        Limit: 100,
      }));
      return (result.Items ?? []).map(publicContactMessage);
    }

    if (fieldName === 'deleteContactMessage') {
      const id = event.arguments.id?.trim() ?? '';
      if (!UUID_PATTERN.test(id)) throw new Error('Invalid contact message.');
      await send(new DeleteCommand({
        TableName,
        Key: { id },
        ConditionExpression: 'recordType = :message',
        ExpressionAttributeValues: { ':message': 'MESSAGE' },
      }));
      return true;
    }

    throw new Error('Unsupported contact operation.');
  };
}

const contactMessagesHandler = createContactMessagesHandler(
  (command) => client.send(command as never) as Promise<CommandResult>,
);

export const handler: AppSyncResolverHandler<ContactArguments, unknown> = contactMessagesHandler;
