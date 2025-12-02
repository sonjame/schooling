import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  const page = searchParams.get('page') || '1'

  if (!query) {
    return NextResponse.json(
      { error: '검색어(q)가 필요합니다.' },
      { status: 400 }
    )
  }

  const API_KEY = `ttbdongseok40612027001`
  const API_URL = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${API_KEY}&Query=${encodeURIComponent(
  query
)}&QueryType=Keyword&MaxResults=10&start=${page}&SearchTarget=Book&output=js&Version=20131101&Cover=Big`


  try {
    const res = await fetch(API_URL)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'API 요청 실패' }, { status: 500 })
  }
}
