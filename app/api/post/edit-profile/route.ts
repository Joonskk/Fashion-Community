import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
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
  profileImage?: string;
};

type ImageInfo = {
  public_id: string;
  url: string;
};

type CommentUpdateFields = {
  userName: string;
  profileImage?: string;
}

// Post ( 회원가입 )
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email as string;

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

  if (!name || !height || !weight || !sex || !email) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  try {
      const db = (await clientPromise).db('wearly')
      await db.collection('users').insertOne({ 
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
      })
      return NextResponse.redirect(new URL('/mypage', req.url))
    } catch (error) {
      console.error('DB 저장 중 에러:', error)
      return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
    }
}

// Get ( My Page 로 정보 받아올 때 )
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('wearly')

    const users = await db.collection('users').find({}, {
      projection: { _id: 1, name: 1, height: 1, weight: 1, email: 1, profileImage: 1, followersCount: 1, followingCount: 1 } // _id 포함해서 필요한 필드 가져옴
    }).toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('DB 불러오기 에러:', error)
    return NextResponse.json({ error: 'DB 조회 오류' }, { status: 500 })
  }
}

// Patch ( Edit Proifile 할 때)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email as string;

  const { name, height, weight, profileImage } = await req.json(); // JSON 데이터를 받음
  
  if (!name || !height || !weight || !email) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  try {
    const db = (await clientPromise).db('wearly');

    const user = await db.collection("users").findOne({email: email});
    if (!user) {
      return NextResponse.json({ message: "유저를 찾을 수 없습니다." }, { status: 404 });
    }
    if(user.profileImage.public_id) {
      await cloudinary.uploader.destroy(user.profileImage.public_id); // Cloudinary에서 기존 profileImage 삭제
    }

    const updateFields: UpdateUserFields = {
      name,
      height,
      weight,
    };    

    if (profileImage) updateFields.profileImage = profileImage; // 이미지 있으면 업데이트


    // 사용자의 이메일을 기반으로 프로필 정보 업데이트
    const result = await db.collection('users').updateOne(
      { email }, // 이메일로 특정 사용자 찾기
      {
        $set: updateFields,
      }
    );

    // 댓글 정보 업데이트
    const commentUpdateFields : CommentUpdateFields = {
      userName: name,
    };

    // 프로필 이미지가 있을 때만 추가
    if (profileImage) {
      commentUpdateFields.profileImage = profileImage.url;
    }

    await db.collection("comments").updateMany(
      { userEmail: email },
      { $set: commentUpdateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: '업데이트할 데이터가 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ message: '프로필이 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('DB 업데이트 오류:', error);
    return NextResponse.json({ error: 'DB 업데이트 오류' }, { status: 500 });
  }
}