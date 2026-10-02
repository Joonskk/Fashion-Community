// app/api/post/search/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Filter } from "mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const q = searchParams.get("q")?.trim() || "";
    const styles = searchParams.get("styles")?.split(",").filter(Boolean) || [];
    const items = searchParams.get("items")?.split(",").filter(Boolean) || [];
    const season = searchParams.get("season")?.trim() || "";
    const gender = searchParams.get("gender")?.trim() || "";
    const colors = searchParams.get("colors")?.split(",").filter(Boolean) || [];

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // Construct MongoDB filter object
    const queryFilter: Filter<any> = {};

    // 1. Broad Text / Keyword Search across text fields and arrays
    if (q) {
      const searchRegex = { $regex: q, $options: "i" };
      queryFilter.$or = [
        { description: searchRegex },
        { authorName: searchRegex },
        { items: searchRegex },   // Matches if any item in the items array matches the query
        { colors: searchRegex },  // Matches if any color in the colors array matches the query
        { styles: searchRegex },  // Matches if any style tag matches the query
      ];
    }

    // 2. Explicit Filter Pill / Dropdown Filters
    if (styles.length > 0) {
      queryFilter.styles = { $in: styles };
    }

    if (items.length > 0) {
      queryFilter.items = { $in: items };
    }

    if (colors.length > 0) {
      queryFilter.colors = { $in: colors };
    }

    // 3. Single String Field Filters
    if (season) {
      queryFilter.season = season;
    }

    if (gender) {
      queryFilter.gender = gender;
    }

    const client = await clientPromise;
    const db = client.db("wearly");

    const [posts, total] = await Promise.all([
      db
        .collection("posts")
        .find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("posts").countDocuments(queryFilter),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Failed to search posts" },
      { status: 500 }
    );
  }
}
