import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Post ( 회원가입 )
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email as string;

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const height = formData.get("height") as string;
  const weight = formData.get("weight") as string;

  const followers: string[] = [];
  const following: string[] = [];
  const followersCount: number = 0;
  const followingCount: number = 0;

  if (!name || !height || !weight || !email) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  if (!name || !height || !weight || !email) {
    return NextResponse.json({ error: '내용을 입력해주세요!' }, { status: 400 })
  }

  try {
      console.log(clientPromise);
      console.log("MONGODB 연결중...")
      const db = (await clientPromise).db('wearly')
      console.log("MongoDB 연결됨!")
      await db.collection('users').insertOne({ 
        name,
        height,
        weight,
        email,
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
      projection: { _id: 1, name: 1, height: 1, weight: 1, email: 1, followersCount: 1, followingCount: 1 } // _id 포함해서 필요한 필드 가져옴
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

  const { name, height, weight } = await req.json(); // JSON 데이터를 받음
  
  if (!name || !height || !weight || !email) {
    return NextResponse.json({ error: '모든 정보를 입력해주세요.' }, { status: 400 });
  }

  try {
    const db = (await clientPromise).db('wearly');
    // 사용자의 이메일을 기반으로 프로필 정보 업데이트
    const result = await db.collection('users').updateOne(
      { email }, // 이메일로 특정 사용자 찾기
      {
        $set: {
          name,
          height,
          weight,
        },
      }
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