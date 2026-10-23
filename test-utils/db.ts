import { MongoMemoryServer } from "mongodb-memory-server";

export async function startTestDb() {
    // 1. Start a fresh MongoDB that lives only while the tests run.
    const mongod = await MongoMemoryServer.create();

    // 2. Point the app at it BEFORE importing anything that touches the DB.
    //    lib/mongodb.ts reads MONGODB_URI and connects the moment it is imported.
    process.env.MONGODB_URI = mongod.getUri();

    // 3. Import only now. A normal top-of-file import would run before step 2.
    const clientPromise = (await import("@/lib/mongodb")).default;

    const db = (await clientPromise).db('wearly');

    const stop = async () => {
        await (await clientPromise).close(); // close the app's connection
        await mongod.stop();                 // shut down the throwaway DB
    }

    return { db, stop };
}