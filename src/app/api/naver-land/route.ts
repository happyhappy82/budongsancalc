import { NextRequest, NextResponse } from 'next/server'
import {
  fetchArticles,
  fetchComplexList,
  SEOUL_GU_CODES,
  SEOUL_CODE,
  type TradeType,
} from '@/lib/naver-land'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') ?? 'articles'
  const cortarNo = searchParams.get('cortarNo') ?? SEOUL_CODE
  const guName = searchParams.get('gu')

  const resolvedCortarNo = guName ? (SEOUL_GU_CODES[guName] ?? cortarNo) : cortarNo

  try {
    if (type === 'complexes') {
      const data = await fetchComplexList(resolvedCortarNo)
      return NextResponse.json(data)
    }

    const tradeType = (searchParams.get('tradeType') as TradeType) ?? 'A1'
    const page = parseInt(searchParams.get('page') ?? '1', 10)

    const data = await fetchArticles({
      cortarNo: resolvedCortarNo,
      tradeType,
      page,
    })

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
