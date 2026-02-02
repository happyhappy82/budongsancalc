export const NAV_ITEMS = [
  { label: '홈', href: '/' },
  { label: '월세/전세 변환', href: '/rent-convert' },
  { label: '취득세', href: '/acquisition-tax' },
  { label: '양도소득세', href: '/transfer-tax' },
  { label: '재산세', href: '/property-tax' },
  { label: '종합부동산세', href: '/comprehensive-tax' },
  { label: '대출/상환', href: '/loan' },
  { label: '투자수익률', href: '/investment-return' },
] as const;

export type NavItem = typeof NAV_ITEMS[number];
