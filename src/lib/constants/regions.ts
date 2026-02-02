export interface RegionInfo {
  readonly name: string
  readonly regulated: boolean
  readonly category: 'speculation' | 'overheated' | 'regulated' | 'none'
}

export const SEOUL_DISTRICTS: readonly RegionInfo[] = [
  '강남구', '서초구', '송파구', '강동구', '용산구',
  '성동구', '광진구', '동대문구', '중랑구', '성북구',
  '강북구', '도봉구', '노원구', '은평구', '서대문구',
  '마포구', '양천구', '강서구', '구로구', '금천구',
  '영등포구', '동작구', '관악구', '종로구', '중구',
].map((name): RegionInfo => ({
  name: `서울 ${name}`,
  regulated: true,
  category: 'overheated',
}))

export const REGULATED_GYEONGGI: readonly RegionInfo[] = [
  '과천시', '성남시 분당구', '하남시', '광명시',
].map((name): RegionInfo => ({
  name: `경기 ${name}`,
  regulated: true,
  category: 'regulated',
}))

export const ALL_REGULATED_REGIONS: readonly RegionInfo[] = [
  ...SEOUL_DISTRICTS,
  ...REGULATED_GYEONGGI,
]
