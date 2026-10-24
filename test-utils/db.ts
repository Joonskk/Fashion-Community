import { getClient } from "@/lib/mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

export async function startTestDb() {
    // 1. Start a fresh MongoDB that lives only while the tests run.
    const mongod = await MongoMemoryServer.create();

    // 2. lib/mongodb.ts connects on the first getClient() call, so set the URI before that.
    process.env.MONGODB_URI = mongod.getUri();

    const db = (await getClient()).db('wearly');

    const stop = async () => {
        await (await getClient()).close(); // close the app's connection
        await mongod.stop();                 // shut down the throwaway DB
    }

    return { db, stop };
}