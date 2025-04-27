import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { auth } from '@/auth'

// Post ( 회원가입 )
export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email as string;

  const body = await req.formData();
  const name = body.get('name') as string;
  const height = body.get('height') as string;
  const weight = body.get('weight') as string;
  
  {/*
  const {name, height, weight} = await req.json();
  */}

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
      email
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
    const client = await clientPromise
    const db = client.db('wearly')

    const users = await db.collection('users').find({}, {
      projection: { _id: 0, name: 1, height: 1, weight: 1, email: 1 } // _id는 제외하고 필요한 필드만 가져옴
    }).toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('DB 불러오기 에러:', error)
    return NextResponse.json({ error: 'DB 조회 오류' }, { status: 500 })
  }
}
