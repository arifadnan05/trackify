import { MongoClient, Db } from "mongodb";

type CachedConnection = {
  conn: { client: MongoClient; db: Db } | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
};

declare global {
  var mongo: CachedConnection;
}

const uri: string = process.env.MONGODB_URI || "DefaultMongoURI";
const dbName = process.env.MONGODB_DB || "mydb";

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached: CachedConnection = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db(dbName),
      };
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
