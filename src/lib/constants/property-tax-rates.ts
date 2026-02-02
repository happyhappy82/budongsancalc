// =============================================================================
// 재산세 (Property Tax) - 2025-2026 Korean Tax Rates
// =============================================================================
// Legal basis:
//   - 지방세법 제111조 (재산세 세율)
//   - 지방세법 제111조의2 (1세대 1주택 세율특례)
//   - 지방세법 제112조 (세율의 특례 - 도시지역분)
//   - 행정안전부 고시 (공정시장가액비율 특례)
// Last verified: 2025-01 (applicable through 2026)
// =============================================================================

export interface PropertyTaxBracket {
  readonly min: number
  readonly max: number
  readonly baseAmount: number
  readonly rate: number
}

// ---------------------------------------------------------------------------
// 1. 재산세 세율 - 주택분
// ---------------------------------------------------------------------------

/**
 * 일반 주택 재산세 세율 (표준세율)
 *
 * | 과세표준               | 세율   | 누진 기본세액     |
 * |-----------------------|--------|-----------------|
 * | 6,000만원 이하          | 0.10%  | 0               |
 * | 6,000만원 초과 ~ 1.5억  | 0.15%  | 60,000원        |
 * | 1.5억 초과 ~ 3억       | 0.25%  | 195,000원       |
 * | 3억 초과               | 0.40%  | 570,000원       |
 */
export const PROPERTY_TAX_BRACKETS: readonly PropertyTaxBracket[] = [
  { min: 0, max: 60_000_000, baseAmount: 0, rate: 0.001 },
  { min: 60_000_000, max: 150_000_000, baseAmount: 60_000, rate: 0.0015 },
  { min: 150_000_000, max: 300_000_000, baseAmount: 195_000, rate: 0.0025 },
  { min: 300_000_000, max: Infinity, baseAmount: 570_000, rate: 0.004 },
] as const

/**
 * 1세대 1주택 특례세율 (공시가격 9억원 이하 주택에만 적용)
 *
 * | 과세표준               | 세율   | 누진 기본세액     |
 * |-----------------------|--------|-----------------|
 * | 6,000만원 이하          | 0.05%  | 0               |
 * | 6,000만원 초과 ~ 1.5억  | 0.10%  | 30,000원        |
 * | 1.5억 초과 ~ 3억       | 0.20%  | 120,000원       |
 * | 3억 초과               | 0.35%  | 420,000원       |
 */
export const PROPERTY_TAX_BRACKETS_SINGLE_HOME: readonly PropertyTaxBracket[] = [
  { min: 0, max: 60_000_000, baseAmount: 0, rate: 0.0005 },
  { min: 60_000_000, max: 150_000_000, baseAmount: 30_000, rate: 0.001 },
  { min: 150_000_000, max: 300_000_000, baseAmount: 120_000, rate: 0.002 },
  { min: 300_000_000, max: Infinity, baseAmount: 420_000, rate: 0.0035 },
] as const

/** 1세대 1주택 특례세율 적용 공시가격 상한: 9억원 */
export const SINGLE_HOME_SPECIAL_RATE_PRICE_LIMIT = 900_000_000

// ---------------------------------------------------------------------------
// 2. 공정시장가액비율 (Fair Market Value Ratio)
// ---------------------------------------------------------------------------

/** 일반 주택 공정시장가액비율: 60% */
export const FAIR_MARKET_VALUE_RATIO = 0.6

/** 토지/건축물 공정시장가액비율: 70% */
export const FAIR_MARKET_VALUE_RATIO_LAND = 0.7

/**
 * 1세대 1주택 공정시장가액비율 (공시가격 구간별 특례)
 * 2023년 도입, 2025년에도 계속 적용
 */
export const SINGLE_HOME_FAIR_VALUE_RATIO_BRACKETS = [
  { maxPrice: 300_000_000, ratio: 0.43 },
  { maxPrice: 600_000_000, ratio: 0.44 },
  { maxPrice: Infinity, ratio: 0.45 },
] as const

/**
 * 1세대 1주택 공정시장가액비율 반환
 * @param publishedPrice - 공시가격 (원)
 */
export const getSingleHomeFairValueRatio = (publishedPrice: number): number => {
  if (publishedPrice <= 300_000_000) return 0.43
  if (publishedPrice <= 600_000_000) return 0.44
  return 0.45
}

// ---------------------------------------------------------------------------
// 3. 부가세: 도시지역분, 지방교육세
// ---------------------------------------------------------------------------

/** 도시지역분 세율: 과세표준 x 0.14% */
export const CITY_PLANNING_TAX_RATE = 0.0014

/** 지방교육세: 재산세액(도시지역분 제외) x 20% */
export const PROPERTY_LOCAL_EDUCATION_TAX_RATE = 0.2

// ---------------------------------------------------------------------------
// 4. 납부 일정
// ---------------------------------------------------------------------------

export const PROPERTY_TAX_PAYMENT = {
  /** 세액 20만원 이하 시 7월에 전액 납부 */
  fullPaymentThreshold: 200_000,
  /** 7월분: 연세액의 50% (7/16~7/31) */
  firstHalf: { month: 7, startDay: 16, endDay: 31 },
  /** 9월분: 연세액의 50% (9/16~9/30) */
  secondHalf: { month: 9, startDay: 16, endDay: 30 },
} as const

// ---------------------------------------------------------------------------
// 5. 계산 함수
// ---------------------------------------------------------------------------

/**
 * 재산세 과세표준에서 세액 산출 (일반 세율)
 */
export const getPropertyTaxFromBrackets = (taxBase: number): number => {
  for (let i = PROPERTY_TAX_BRACKETS.length - 1; i >= 0; i--) {
    const bracket = PROPERTY_TAX_BRACKETS[i]
    if (taxBase > bracket.min) {
      return bracket.baseAmount + (taxBase - bracket.min) * bracket.rate
    }
  }
  return 0
}

/**
 * 재산세 과세표준에서 세액 산출 (1세대 1주택 특례세율)
 */
export const getSingleHomePropertyTax = (taxBase: number): number => {
  for (let i = PROPERTY_TAX_BRACKETS_SINGLE_HOME.length - 1; i >= 0; i--) {
    const bracket = PROPERTY_TAX_BRACKETS_SINGLE_HOME[i]
    if (taxBase > bracket.min) {
      return bracket.baseAmount + (taxBase - bracket.min) * bracket.rate
    }
  }
  return 0
}

// ---------------------------------------------------------------------------
// 재산세 전체 계산 흐름 (pseudocode)
// ---------------------------------------------------------------------------
//
// STEP 1: 과세표준 = 공시가격 x 공정시장가액비율
//   - 1세대1주택 (9억 이하): getSingleHomeFairValueRatio(공시가격) => 43~45%
//   - 일반: 60%
//
// STEP 2: 재산세 = getPropertyTaxFromBrackets(과세표준)  [일반]
//                  getSingleHomePropertyTax(과세표준)     [1세대1주택]
//
// STEP 3: 부가세
//   도시지역분 = 과세표준 x 0.14%
//   지방교육세 = 재산세 x 20%
//
// STEP 4: 총 납부세액 = 재산세 + 도시지역분 + 지방교육세
// ---------------------------------------------------------------------------
