// app/api/user/[email]/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ email: string }> | { email: string } }
) {
  try {
    // 1. Await params if it is a Promise (Next.js 15+ compatibility)
    const resolvedParams = await params;
    const rawEmail = resolvedParams?.email;

    if (!rawEmail) {
      return NextResponse.json({ error: "Email parameter missing" }, { status: 400 });
    }

    const email = decodeURIComponent(rawEmail).trim();

    // 2. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("wearly");

    // 3. Query the user collection using case-insensitive exact regex match
    const user = await db.collection("users").findOne(
      { email: { $regex: `^${email}$`, $options: "i" } },
      {
        projection: {
          _id: 1,
          name: 1,
          email: 1,
          height: 1,
          weight: 1,
          sex: 1,
          profileImage: 1,
          followersCount: 1,
          followingCount: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    // Log the exact error in your terminal server logs for debugging
    console.error("User API route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
