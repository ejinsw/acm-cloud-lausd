const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || 'us-west-1';
const dynamodbEndpoint = process.env.DYNAMODB_ENDPOINT || process.env.DYNAMODB_LOCAL_ENDPOINT;

// CHANGED: DAX disabled - using direct DynamoDB connection only
// const disableDax =
//   typeof process.env.DISABLE_DAX === 'string' &&
//   ['1', 'true', 'yes'].includes(process.env.DISABLE_DAX.toLowerCase());
// const daxEndpoint = !disableDax && !dynamodbEndpoint ? process.env.DAX_ENDPOINT : undefined;

// CHANGED: DAX client initialization commented out
// let daxService = null;
// if (daxEndpoint) {
//   try {
//     const AmazonDaxClient = require('amazon-dax-client');
//     daxService = new AmazonDaxClient({ region, endpoints: [daxEndpoint] });
//   } catch (error) {
//     console.warn('amazon-dax-client not installed; continuing without DAX');
//   }
// }

const dynamoDocClient = new AWS.DynamoDB.DocumentClient({
  region,
  ...(dynamodbEndpoint ? { endpoint: dynamodbEndpoint } : {}),
});

// CHANGED: DAX client disabled - using only DynamoDB
// const daxDocClient = daxService ? new AWS.DynamoDB.DocumentClient({ service: daxService }) : null;
const daxDocClient = null;

// CHANGED: DAX health tracking disabled
// let daxHealthy = Boolean(daxDocClient);
// let daxFallbackLogged = false;
let daxHealthy = false;
let daxFallbackLogged = false;

// CHANGED: DAX connectivity error detection no longer needed
// function isDaxConnectivityError(error) {
//   const code = error?.code || error?.name;
//   const message = String(error?.message || '').toLowerCase();
//   const errno = error?.errno;
//
//   const retryableCodes = new Set(['NetworkingError', 'TimeoutError', 'UnknownEndpoint']);
//   const retryableErrnos = new Set([
//     'ECONNREFUSED',
//     'EHOSTUNREACH',
//     'ENETUNREACH',
//     'ENOTFOUND',
//     'ETIMEDOUT',
//     'ECONNRESET',
//   ]);
//
//   if (typeof code === 'string' && retryableCodes.has(code)) return true;
//   if (typeof errno === 'string' && retryableErrnos.has(errno)) return true;
//   if (typeof code === 'string' && retryableErrnos.has(code)) return true;
//   if (
//     message.includes('econnrefused') ||
//     message.includes('enotfound') ||
//     message.includes('timed out')
//   )
//     return true;
//
//   return false;
// }

// CHANGED: Simplified to use only DynamoDB (no DAX fallback logic)
async function docCall(operation, params) {
  // Direct DynamoDB call only
  return dynamoDocClient[operation](params).promise();
  
  // CHANGED: DAX fallback logic commented out
  // if (daxHealthy && daxDocClient) {
  //   try {
  //     return await daxDocClient[operation](params).promise();
  //   } catch (error) {
  //     if (!isDaxConnectivityError(error)) {
  //       throw error;
  //     }
  //
  //     daxHealthy = false;
  //     if (!daxFallbackLogged) {
  //       daxFallbackLogged = true;
  //       console.warn('DAX request failed; falling back to DynamoDB');
  //     }
  //   }
  // }
  //
  // return dynamoDocClient[operation](params).promise();
}

const tables = {
  rooms: process.env.ROOMS_TABLE_NAME,
  members: process.env.ROOM_MEMBERS_TABLE_NAME,
  messages: process.env.ROOM_MESSAGES_TABLE_NAME,
  sessions: process.env.USER_SESSIONS_TABLE_NAME,
};

Object.entries(tables).forEach(([name, value]) => {
  if (!value) {
    throw new Error(`Missing required env var for ${name} table`);
  }
});

const MAX_SESSION_TTL_MS = Number(process.env.MAX_SESSION_TTL_MS || 24 * 60 * 60 * 1000);
const SESSION_IDLE_TIMEOUT_MS = Number(process.env.SESSION_IDLE_TIMEOUT_MS || 30 * 60 * 1000);

function ttlSeconds(durationMs = MAX_SESSION_TTL_MS) {
  const safeDuration = Math.max(1000, Math.min(durationMs, MAX_SESSION_TTL_MS));
  return Math.floor((Date.now() + safeDuration) / 1000);
}

function defaultExpiry() {
  return ttlSeconds(MAX_SESSION_TTL_MS);
}

function sessionExpiry() {
  return ttlSeconds(SESSION_IDLE_TIMEOUT_MS);
}

async function batchWriteChunks(tableName, requests) {
  const queue = [...requests];
  while (queue.length) {
    const batch = queue.splice(0, 25);
    await docCall('batchWrite', {
      RequestItems: {
        [tableName]: batch,
      },
    });
  }
}

async function deleteAllRoomItems(tableName, sortKeyName, roomId) {
  let lastKey = null;
  do {
    const response = await docCall('query', {
      TableName: tableName,
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: { ':roomId': roomId },
      ProjectionExpression: `roomId, ${sortKeyName}`,
      ExclusiveStartKey: lastKey || undefined,
    });
    const deleteRequests =
      response.Items?.map(item => ({
        DeleteRequest: {
          Key: {
            roomId: item.roomId,
            [sortKeyName]: item[sortKeyName],
          },
        },
      })) || [];
    if (deleteRequests.length) {
      await batchWriteChunks(tableName, deleteRequests);
    }
    lastKey = response.LastEvaluatedKey || null;
  } while (lastKey);
}

async function createRoom({ id, name, ownerId, settings }) {
  const now = Date.now();
  await docCall('put', {
    TableName: tables.rooms,
    Item: {
      roomId: id,
      name,
      ownerId,
      settings,
      createdAt: now,
      lastActivity: now,
      participantCount: 0,
      messageCount: 0,
      expiresAt: defaultExpiry(),
    },
    ConditionExpression: 'attribute_not_exists(roomId)',
  });
  return { roomId: id, name };
}

async function getRoom(roomId) {
  const { Item } = await docCall('get', { TableName: tables.rooms, Key: { roomId } });
  return Item || null;
}

async function listRooms() {
  const results = await docCall('scan', {
    TableName: tables.rooms,
    ProjectionExpression: 'roomId, #name, participantCount, lastActivity',
    ExpressionAttributeNames: { '#name': 'name' },
  });
  return (results.Items || [])
    .map(item => ({
      id: item.roomId,
      name: item.name,
      userCount: item.participantCount || 0,
      lastActivity: item.lastActivity || 0,
    }))
    .sort((a, b) => b.lastActivity - a.lastActivity);
}

async function addMember(roomId, user) {
  const now = Date.now();
  await docCall('put', {
    TableName: tables.members,
    Item: {
      roomId,
      userId: user.id,
      username: user.username,
      type: user.type,
      joinedAt: now,
      expiresAt: defaultExpiry(),
    },
    ConditionExpression: 'attribute_not_exists(roomId) AND attribute_not_exists(userId)',
  }).catch(err => {
    if (err.code !== 'ConditionalCheckFailedException') throw err;
  });

  await docCall('update', {
    TableName: tables.rooms,
    Key: { roomId },
    UpdateExpression: 'SET lastActivity = :now, expiresAt = :expiresAt ADD participantCount :inc',
    ExpressionAttributeValues: {
      ':now': now,
      ':expiresAt': defaultExpiry(),
      ':inc': 1,
    },
  });
}

async function removeMember(roomId, userId) {
  const now = Date.now();
  await docCall('delete', {
    TableName: tables.members,
    Key: { roomId, userId },
  });

  try {
    const result = await docCall('update', {
      TableName: tables.rooms,
      Key: { roomId },
      UpdateExpression: 'SET lastActivity = :now, expiresAt = :expiresAt ADD participantCount :dec',
      ExpressionAttributeValues: {
        ':now': now,
        ':expiresAt': defaultExpiry(),
        ':dec': -1,
      },
      ReturnValues: 'UPDATED_NEW',
    });
    return Math.max(0, result.Attributes?.participantCount ?? 0);
  } catch (err) {
    if (
      err.code === 'ValidationException' ||
      err.code === 'ConditionalCheckFailedException' ||
      err.code === 'ResourceNotFoundException'
    ) {
      return 0;
    }
    throw err;
  }
}

async function listMembers(roomId) {
  const results = await docCall('query', {
    TableName: tables.members,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: { ':roomId': roomId },
  });
  return (results.Items || []).map(item => ({
    id: item.userId,
    username: item.username,
    type: item.type,
  }));
}

async function saveMessage(roomId, message) {
  let sentAt = Date.now();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await docCall('put', {
        TableName: tables.messages,
        Item: {
          roomId,
          sentAt,
          messageId: message.id,
          text: message.text,
          sender: message.sender,
          timestamp: sentAt,
          expiresAt: defaultExpiry(),
        },
        ConditionExpression: 'attribute_not_exists(roomId) AND attribute_not_exists(sentAt)',
      });
      break;
    } catch (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        sentAt += 1;
      } else {
        throw err;
      }
    }
  }

  const updateResult = await docCall('update', {
    TableName: tables.rooms,
    Key: { roomId },
    UpdateExpression: 'SET lastActivity = :now, expiresAt = :expiresAt ADD messageCount :inc',
    ExpressionAttributeValues: {
      ':now': sentAt,
      ':expiresAt': defaultExpiry(),
      ':inc': 1,
    },
    ReturnValues: 'UPDATED_NEW',
  });

  const messageCount = updateResult.Attributes?.messageCount || 0;
  if (messageCount > 200) {
    const oldest = await docCall('query', {
      TableName: tables.messages,
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: { ':roomId': roomId },
      Limit: messageCount - 200,
      ScanIndexForward: true,
      ProjectionExpression: 'roomId, sentAt',
    });
    if (oldest.Items?.length) {
      const deleteRequests = oldest.Items.map(item => ({
        DeleteRequest: {
          Key: { roomId, sentAt: item.sentAt },
        },
      }));
      await batchWriteChunks(tables.messages, deleteRequests);
      await docCall('update', {
        TableName: tables.rooms,
        Key: { roomId },
        UpdateExpression: 'SET messageCount = :target',
        ExpressionAttributeValues: { ':target': 200 },
      });
    }
  }
  return { ...message, timestamp: sentAt };
}

async function fetchMessages(roomId, limit = 50) {
  const results = await docCall('query', {
    TableName: tables.messages,
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: { ':roomId': roomId },
    Limit: limit,
    ScanIndexForward: false,
  });
  return (results.Items || [])
    .map(item => ({
      id: item.messageId,
      text: item.text,
      sender: item.sender,
      roomId,
      timestamp: item.timestamp,
    }))
    .reverse();
}

async function deleteMessage(roomId, messageId) {
  const lookup = await docCall('query', {
    TableName: tables.messages,
    IndexName: 'messageId',
    KeyConditionExpression: 'messageId = :messageId',
    ExpressionAttributeValues: { ':messageId': messageId },
    Limit: 1,
  });

  const match = lookup.Items?.find(item => item.roomId === roomId);
  if (!match) return false;

  await docCall('delete', {
    TableName: tables.messages,
    Key: { roomId, sentAt: match.sentAt },
  });

  await docCall('update', {
    TableName: tables.rooms,
    Key: { roomId },
    UpdateExpression: 'SET lastActivity = :now, expiresAt = :expiresAt ADD messageCount :dec',
    ExpressionAttributeValues: {
      ':now': Date.now(),
      ':expiresAt': defaultExpiry(),
      ':dec': -1,
    },
  });

  return true;
}

async function setUserSession(user) {
  await docCall('put', {
    TableName: tables.sessions,
    Item: {
      userId: user.id,
      username: user.username,
      type: user.type,
      currentRoomId:
        Object.prototype.hasOwnProperty.call(user, 'currentRoomId') && user.currentRoomId
          ? user.currentRoomId
          : null,
      lastSeen: Date.now(),
      expiresAt: sessionExpiry(),
    },
  });
}

async function removeUserSession(userId) {
  await docCall('delete', {
    TableName: tables.sessions,
    Key: { userId },
  });
}

async function expireRoom(roomId) {
  await docCall('delete', {
    TableName: tables.rooms,
    Key: { roomId },
  }).catch(err => {
    if (
      err.code !== 'ResourceNotFoundException' &&
      err.code !== 'ConditionalCheckFailedException'
    ) {
      throw err;
    }
  });

  await Promise.all([
    deleteAllRoomItems(tables.members, 'userId', roomId),
    deleteAllRoomItems(tables.messages, 'sentAt', roomId),
  ]);
}

module.exports = {
  createRoom,
  getRoom,
  listRooms,
  addMember,
  removeMember,
  listMembers,
  saveMessage,
  fetchMessages,
  deleteMessage,
  setUserSession,
  removeUserSession,
  expireRoom,
};
