import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type UpdateUserFields = {
  name: string;
  height: string;
  weight: string;
  profileImage?: ImageInfo;
};

type ImageInfo = {
  public_id: string;
  url: string;
};

type CommentUpdateFields = {
  userName: string;
  profileImage?: string;
};

// POST: Sign Up / Initial User Registration
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const email = session.user.email;
  const formData = await req.formData();

  const name = formData.get("name") as string;
  const height = formData.get("height") as string;
  const weight = formData.get("weight") as string;
  const sex = formData.get("sex") as string;

  const followers: string[] = [];
  const following: string[] = [];
  const followersCount: number = 0;
  const followingCount: number = 0;

  const DEFAULT_PROFILE_IMAGE: ImageInfo = {
    public_id: "",
    url: "/profile-default.png"
  };

  if (!name || !height || !weight || !sex) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  try {
    const db = (await clientPromise).db('wearly');

    const newUser = {
      name,
      height,
      weight,
      email,
      sex,
      profileImage: DEFAULT_PROFILE_IMAGE,
      followers,
      following,
      followersCount,
      followingCount,
    };

    const result = await db.collection('users').insertOne(newUser);

    // Return the created user object directly to the client
    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user: { _id: result.insertedId.toString(), ...newUser }
    });
  } catch (error) {
    console.error('DB 저장 중 에러:', error);
    return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 });
  }
}

// PATCH: Edit Profile Information
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
  }

  const email = session.user.email;
  const { name, height, weight, profileImage } = await req.json();

  if (!name || !height || !weight) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  try {
    const db = (await clientPromise).db('wearly');

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "유저를 찾을 수 없습니다." }, { status: 404 });
    }

    if (profileImage && user.profileImage?.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id);
    }

    const updateFields: UpdateUserFields = {
      name,
      height,
      weight,
    };

    if (profileImage) updateFields.profileImage = profileImage;

    const result = await db.collection('users').updateOne(
      { email },
      { $set: updateFields }
    );

    const commentUpdateFields: CommentUpdateFields = {
      userName: name,
    };

    if (profileImage?.url) {
      commentUpdateFields.profileImage = profileImage.url;
    }

    await db.collection("comments").updateMany(
      { userEmail: email },
      { $set: commentUpdateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: '업데이트할 데이터가 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '프로필이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('DB 업데이트 오류:', error);
    return NextResponse.json({ error: 'DB 업데이트 오류' }, { status: 500 });
  }
}
