export interface NavCategory {
  readonly label: string
  readonly items: readonly NavItem[]
}

export interface NavItem {
  readonly label: string
  readonly href: string
}

export const NAV_CATEGORIES: readonly NavCategory[] = [
  {
    label: '세금',
    items: [
      { label: '취득세', href: '/acquisition-tax' },
      { label: '양도소득세', href: '/transfer-tax' },
      { label: '재산세', href: '/property-tax' },
      { label: '종합부동산세', href: '/comprehensive-tax' },
      { label: '보유세 통합', href: '/holding-tax' },
      { label: '증여세', href: '/gift-tax' },
      { label: '상속세', href: '/inheritance-tax' },
      { label: '종합소득세', href: '/income-tax' },
      { label: '임대소득세', href: '/rental-income-tax' },
      { label: '인지세', href: '/stamp-tax' },
      { label: '지역자원시설세', href: '/regional-tax' },
      { label: '누진세율', href: '/progressive-tax' },
      { label: '건물분 부가세', href: '/building-vat' },
      { label: '착한임대인', href: '/good-landlord' },
    ],
  },
  {
    label: '대출',
    items: [
      { label: '대출/상환', href: '/loan' },
      { label: 'DSR', href: '/dsr' },
      { label: 'DTI', href: '/dti' },
      { label: 'LTV', href: '/ltv' },
      { label: '최대대출금액', href: '/max-loan' },
      { label: '경락대출한도', href: '/foreclosure-loan' },
      { label: '장래소득 추정', href: '/future-income' },
      { label: '중도상환수수료', href: '/early-repayment' },
      { label: '연체이자', href: '/overdue-interest' },
      { label: '예적금이자', href: '/savings-interest' },
    ],
  },
  {
    label: '임대차',
    items: [
      { label: '월세/전세 변환', href: '/rent-convert' },
      { label: '임대료 인상률', href: '/rent-increase' },
      { label: '임대료 조정', href: '/rent-adjust' },
      { label: '간주임대료', href: '/deemed-rental' },
    ],
  },
  {
    label: '투자·수익',
    items: [
      { label: '투자수익률', href: '/investment-return' },
      { label: '임대수익률', href: '/rental-yield' },
      { label: 'RTI', href: '/rti' },
      { label: '추정소득', href: '/estimated-income' },
      { label: '재건축 초과이익', href: '/reconstruction' },
    ],
  },
  {
    label: '경매',
    items: [
      { label: '경매비용', href: '/auction-cost' },
      { label: '배당 계산', href: '/auction-distribution' },
      { label: '명도비용', href: '/eviction-cost' },
    ],
  },
  {
    label: '비용·수수료',
    items: [
      { label: '등기비용', href: '/registration-cost' },
      { label: '법무사보수', href: '/attorney-fee' },
      { label: '국민주택채권', href: '/housing-bond' },
      { label: '감정평가수수료', href: '/appraisal-fee' },
      { label: '중개보수', href: '/brokerage' },
    ],
  },
  {
    label: '건물·분석',
    items: [
      { label: '건폐율·용적률', href: '/building-ratio' },
      { label: '건물기준시가', href: '/building-price' },
      { label: '토지지분가', href: '/land-share' },
      { label: '기준시가 단가', href: '/unit-price' },
      { label: '잔존가치', href: '/remaining-value' },
    ],
  },
  {
    label: '유틸리티',
    items: [
      { label: '면적 변환', href: '/area-convert' },
      { label: '날짜 계산', href: '/date-calc' },
      { label: '상속지분', href: '/inheritance-share' },
    ],
  },
] as const

// Flat list for backward compatibility
export const NAV_ITEMS = [
  { label: '홈', href: '/' },
  ...NAV_CATEGORIES.flatMap((cat) => cat.items),
] as const
