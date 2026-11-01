import { MongoClient } from "mongodb";

const URI = "mongodb://localhost:27017";
const COUNT = 100000;

const IMAGES = ["/styles/Style12.jpeg", 
                "/styles/Style13.jpeg",
                "/styles/Style14.jpeg", 
                "/styles/Style15.jpeg", 
                "/styles/Style16.jpeg"];
const SEXES = ["male", "female"];
const USERS = [];
for (let i = 0; i < 50; i++) {
  USERS.push(`seed${i}@seed.local`);
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function makePost() {
    const daysAgo = Math.random() * 365;
    return {
        userEmail: pick(USERS),
        authorName: "Seed User",
        sex: pick(SEXES),
        images: [{ public_id: "seed", url: pick(IMAGES) }],
        description: "seeded post",
        styles: [],
        likes: [],
        likesCount: Math.floor(Math.random() * 500),
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000), // random time in the last year
        aiStatus: "done",
        seed: true,
    };
}

const client = new MongoClient(URI);
await client.connect();
const posts = client.db("wearly").collection("posts");

await posts.deleteMany({ seed: true }); // start fresh: remove old fake posts, keep real ones

const batch = Array.from({ length: COUNT }, makePost); // 10,000 posts in an array
await posts.insertMany(batch);                           // one call that inserts many docs

console.log("total posts:", await posts.countDocuments());
await client.close();