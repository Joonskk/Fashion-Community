import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(req: Request) {
  const body = await req.formData()
  const name = body.get('name') as string
  const height = body.get('height') as string
  const weight = body.get('weight') as string

  if (!name || !height || !weight) {
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
      weight
    })
    return NextResponse.redirect(new URL('/mypage', req.url)) // redirect 처리
  } catch (error) {
    console.error('DB 저장 중 에러:', error)
    return NextResponse.json({ error: 'DB 저장 오류' }, { status: 500 })
  }
}
