import clientPromise from "@/lib/mongodb";
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function DELETE(){
    try {
        const client = await clientPromise;
        const db = client.db('wearly');
        
        // 현재 로그인한 유저 가져오기
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
            });
        }

        const userEmail = session.user.email;

        // 유저 관련 정보 모두 삭제
        await db.collection("users").deleteOne({email: userEmail}); // 유저 정보 삭제
        await db.collection("posts").deleteMany({userEmail});       // 유저가 올린 게시물 삭제
        await db.collection("comments").deleteMany({userEmail});    // 유저가 남긴 댓글 삭제
        await db.collection("bookmarks").deleteMany({userEmail});   // 유저가 한 북마크 삭제
        await db.collection("users").updateMany(                    // 다른 유저 팔로워 목록에서 삭제
            { followers: userEmail },
            [
                { $set: { followers: { $setDifference: ["$followers", [userEmail]] } } },
                { $set: { followersCount: { $size: "$followers" } } }
            ]
        );
          
        await db.collection("users").updateMany(                    // 다른 유저 팔로잉 목록에서 삭제
            { following: userEmail },
            [
                { $set: { following: { $setDifference: ["$following", [userEmail]] } } },
                { $set: { followingCount: { $size: "$following" } } }
            ]
        );

        await db.collection("posts").updateMany(                    // 다른 게시물에서 좋아요한 정보 삭제
            { likes: userEmail },
            [
              { $set: { likes: { $setDifference: ["$likes", [userEmail]] } } },
              { $set: { likesCount: { $size: "$likes" } } }
            ]
          );

        return new Response(
            JSON.stringify({ message: "User and related data deleted successfully" }),
            { status: 200 }
        );
    } catch(error) {
        console.error("Delete user error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}