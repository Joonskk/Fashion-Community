// Creates the indexes Wearly's feed queries need. Safe to re-run.
// Run: MONGODB_URI="mongodb://localhost:27017/wearly" node scripts/create-indexes.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Set MONGODB_URI");

const client = new MongoClient(uri);
await client.connect();
const posts = client.db("wearly").collection("posts");

await posts.createIndexes([
    { key: { createdAt: -1, _id: -1 }, name: "newest" },
    { key: { likesCount: -1, _id: -1 }, name: "ranking" },
    { key: { sex: 1, createdAt: -1, _id: -1 }, name: "sex_newest" },
    { key: { sex: 1, likesCount: -1, _id: -1 }, name: "sex_ranking" },
    { key: { userEmail: 1, createdAt: -1, _id: -1 }, name: "user_newest" },
]);

console.log(await posts.indexes());
await client.close();
