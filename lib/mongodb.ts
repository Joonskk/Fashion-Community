import { MongoClient } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri: string = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function initIndexes(): Promise<void> {
  const mongoClient = await clientPromise;
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

export default clientPromise;
