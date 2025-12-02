import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const API_KEY = `ttbdongseok40612027001`;

  const MaxResults = 5;

  // 🔥 startIndex 계산 (알라딘 페이지 규칙에 맞게)
  const startIndex = (page - 1) * MaxResults + 1;

  // 🔥 startIndex를 URL에 반드시 포함해야 함
  const API_URL = `https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=${API_KEY}&QueryType=Bestseller&MaxResults=${MaxResults}&start=${startIndex}&SearchTarget=Book&Cover=Big&output=js&Version=20131101`;

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'API 요청 실패' }, { status: 500 });
  }
}
