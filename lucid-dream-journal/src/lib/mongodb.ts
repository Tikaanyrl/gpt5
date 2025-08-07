import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  // Allow building without env, but runtime will throw on first DB call
  console.warn('MONGODB_URI is not set. Set it in your environment before running the server.');
}

type GlobalWithMongoose = typeof globalThis & {
  mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const globalForMongoose = global as GlobalWithMongoose;

export async function connectToDatabase() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');

  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = { conn: null, promise: null };
  }

  const cached = globalForMongoose.mongooseConn;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'lucid-dream-journal'
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}