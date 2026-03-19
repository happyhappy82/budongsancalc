/**
 * Naver Real Estate (네이버 부동산) API client
 * Fetches apartment listing data from Naver Land's internal API
 */

const NAVER_LAND_BASE = 'https://new.land.naver.com/api'

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: 'application/json, text/plain, */*',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Referer: 'https://new.land.naver.com/',
}

/** 서울 구별 법정동 코드 */
export const SEOUL_GU_CODES: Record<string, string> = {
  강남구: '1168000000',
  강동구: '1174000000',
  강북구: '1130500000',
  강서구: '1150000000',
  관악구: '1162000000',
  광진구: '1121500000',
  구로구: '1153000000',
  금천구: '1154500000',
  노원구: '1135000000',
  도봉구: '1132000000',
  동대문구: '1123000000',
  동작구: '1159000000',
  마포구: '1144000000',
  서대문구: '1141000000',
  서초구: '1165000000',
  성동구: '1120000000',
  성북구: '1129000000',
  송파구: '1171000000',
  양천구: '1147000000',
  영등포구: '1156000000',
  용산구: '1117000000',
  은평구: '1138000000',
  종로구: '1111000000',
  중구: '1114000000',
  중랑구: '1126000000',
}

export const SEOUL_CODE = '1100000000'

/** 거래 유형 */
export type TradeType = 'A1' | 'B1' | 'B2' | 'B3'
export const TRADE_TYPES: Record<TradeType, string> = {
  A1: '매매',
  B1: '전세',
  B2: '월세',
  B3: '단기임대',
}

export interface NaverArticle {
  articleNo: string
  articleName: string
  realEstateTypeName: string
  tradeTypeName: string
  dealOrWarrantPrc: string
  areaName: string
  area1: number
  area2: number
  direction: string
  articleConfirmYmd: string
  articleFeatureDesc: string
  tagList: string[]
  buildingName: string
  sameAddrCnt: number
  sameAddrDirectCnt: number
  sameAddrHash: string
  cpid: string
  cpName: string
  cpPcArticleUrl: string
  floorInfo: string
  representativeImgUrl: string
  representativeImgThumb: string
  articleStatus: string
  realtorName: string
  tradeTypeCode: string
  detailAddress: string
  detailAddressYn: string
}

export interface NaverArticleResponse {
  isMoreData: boolean
  articleList: NaverArticle[]
  mapExposedCount?: number
}

export interface NaverComplexOverview {
  complexNo: string
  complexName: string
  cortarAddress: string
  detailAddress: string
  totalHouseholdCount: number
  totalBuildingCount: number
  highFloor: number
  lowFloor: number
  useApproveYmd: string
  dealCount: number
  leaseCount: number
  shortTermRentCount: number
  minDealUnitPrice?: number
  maxDealUnitPrice?: number
}

export interface NaverComplexListResponse {
  complexList: NaverComplexOverview[]
}

export interface FetchArticlesParams {
  cortarNo: string
  realEstateType?: string
  tradeType?: TradeType
  page?: number
  sameAddressGroup?: boolean
  order?: string
}

async function naverFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${NAVER_LAND_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') url.searchParams.set(k, v)
  })

  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Naver API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

/** 매물 목록 조회 */
export async function fetchArticles(params: FetchArticlesParams): Promise<NaverArticleResponse> {
  const queryParams: Record<string, string> = {
    cortarNo: params.cortarNo,
    realEstateType: params.realEstateType ?? 'APT',
    tradeType: params.tradeType ?? 'A1',
    order: params.order ?? 'prc',
    page: String(params.page ?? 1),
  }

  if (params.sameAddressGroup !== false) {
    queryParams.sameAddressGroup = 'true'
  }

  return naverFetch<NaverArticleResponse>('/articles', queryParams)
}

/** 단지 목록 조회 */
export async function fetchComplexList(cortarNo: string): Promise<NaverComplexListResponse> {
  return naverFetch<NaverComplexListResponse>('/complexes/overview', {
    cortarNo,
    realEstateType: 'APT',
  })
}
