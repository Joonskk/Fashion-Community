import { MongoClient } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

export function getClient(): Promise<MongoClient> {
  // Already connected (or connecting)? Reuse it.
  if (clientPromise) return clientPromise;

  // The check now runs on the first request, not at import time.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please add your MongoDB URI to .env.local');
  }

  if (process.env.NODE_ENV === 'development') {
    // Dev hot-reload re-runs this file, so cache on `global` to avoid
    // opening a new connection on every save.
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    clientPromise = new MongoClient(uri).connect();
  }

  return clientPromise;
}

export async function initIndexes(): Promise<void> {
  const mongoClient = await getClient();
  const db = mongoClient.db();

  // Posts: Feed queries filtering by user and sorting by date
  await db.collection('posts').createIndex({ userEmail: 1, createdAt: -1 });

  // Posts: Ranking feeds filtering by sex/gender and sorting by likes
  await db.collection('posts').createIndex({ sex: 1, likesCount: -1 });

  // Bookmarks: Quick lookup per user + prevent duplicate bookmarks
  await db.collection('bookmarks').createIndex(
    { userEmail: 1, postId: 1 },
    { unique: true }
  );

  // Likes: Quick lookup per user + prevent duplicate likes
  await db.collection('likes').createIndex(
    { userEmail: 1, postId: 1 },
    { unique: true }
  );

  // Users: Fast lookup by email for user profiles
  await db.collection('users').createIndex(
    { email: 1 },
    { unique: true }
  );
}
