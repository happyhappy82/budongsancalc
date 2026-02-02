// =============================================================================
// 종합부동산세 (Comprehensive Real Estate Tax) - 2025-2026 Korean Tax Rates
// =============================================================================
// Legal basis:
//   - 종합부동산세법 제8조 (과세표준)
//   - 종합부동산세법 제9조 (세율) - 2023년 이후 적용 세율
//   - 종합부동산세법 제10조 (세부담상한)
//   - 종합부동산세법 시행령 (공정시장가액비율 60%)
// Last verified: 2025-01 (applicable through 2026)
// =============================================================================

export interface ComprehensiveTaxBracket {
  readonly min: number
  readonly max: number
  readonly rate: number
  readonly deduction: number
}

// ---------------------------------------------------------------------------
// 1. 기본공제금액 (Threshold / Basic Deduction)
// ---------------------------------------------------------------------------

export const COMPREHENSIVE_TAX_DEDUCTIONS = {
  /** 1세대 1주택자: 12억원 */
  singleHomeOwner: 1_200_000_000,
  /** 일반(다주택 포함): 9억원 */
  general: 900_000_000,
  /** 법인: 0원 (공제 없음) */
  corporate: 0,
} as const

// ---------------------------------------------------------------------------
// 2. 공정시장가액비율
// ---------------------------------------------------------------------------

/** 주택분 공정시장가액비율: 60% (2023년 이후) */
export const COMPREHENSIVE_FAIR_MARKET_RATIO = 0.6

/** 토지분(종합합산/별도합산) 공정시장가액비율: 100% */
export const COMPREHENSIVE_FAIR_MARKET_RATIO_LAND = 1.0

// ---------------------------------------------------------------------------
// 3. 주택분 세율 - 일반 (2주택 이하)
// ---------------------------------------------------------------------------

/**
 * 일반세율 (2주택 이하 개인)
 * 3주택 이상이라도 과세표준 12억 이하 구간은 이 세율 적용
 *
 * | 과세표준                | 세율   | 누진공제         |
 * |------------------------|--------|-----------------|
 * | 3억원 이하              | 0.5%   | 0               |
 * | 3억 초과 ~ 6억          | 0.7%   | 600,000         |
 * | 6억 초과 ~ 12억         | 1.0%   | 2,400,000       |
 * | 12억 초과 ~ 25억        | 1.3%   | 6,000,000       |
 * | 25억 초과 ~ 50억        | 1.5%   | 11,000,000      |
 * | 50억 초과 ~ 94억        | 2.0%   | 36,000,000      |
 * | 94억 초과               | 2.7%   | 101,800,000     |
 */
export const COMPREHENSIVE_TAX_BRACKETS: readonly ComprehensiveTaxBracket[] = [
  { min: 0, max: 300_000_000, rate: 0.005, deduction: 0 },
  { min: 300_000_000, max: 600_000_000, rate: 0.007, deduction: 600_000 },
  { min: 600_000_000, max: 1_200_000_000, rate: 0.01, deduction: 2_400_000 },
  { min: 1_200_000_000, max: 2_500_000_000, rate: 0.013, deduction: 6_000_000 },
  { min: 2_500_000_000, max: 5_000_000_000, rate: 0.015, deduction: 11_000_000 },
  { min: 5_000_000_000, max: 9_400_000_000, rate: 0.02, deduction: 36_000_000 },
  { min: 9_400_000_000, max: Infinity, rate: 0.027, deduction: 101_800_000 },
] as const

// ---------------------------------------------------------------------------
// 4. 주택분 세율 - 중과 (3주택 이상, 과세표준 12억 초과 구간만 중과)
// ---------------------------------------------------------------------------

/**
 * 중과세율 (3주택 이상 개인)
 * 12억 이하 구간은 일반세율과 동일
 *
 * | 과세표준                | 세율   | 누진공제         |
 * |------------------------|--------|-----------------|
 * | 3억원 이하              | 0.5%   | 0               |
 * | 3억 초과 ~ 6억          | 0.7%   | 600,000         |
 * | 6억 초과 ~ 12억         | 1.0%   | 2,400,000       |
 * | 12억 초과 ~ 25억        | 2.0%   | 14,400,000      |
 * | 25억 초과 ~ 50억        | 3.0%   | 39,400,000      |
 * | 50억 초과 ~ 94억        | 4.0%   | 89,400,000      |
 * | 94억 초과               | 5.0%   | 183,400,000     |
 */
export const COMPREHENSIVE_TAX_BRACKETS_MULTI: readonly ComprehensiveTaxBracket[] = [
  { min: 0, max: 300_000_000, rate: 0.005, deduction: 0 },
  { min: 300_000_000, max: 600_000_000, rate: 0.007, deduction: 600_000 },
  { min: 600_000_000, max: 1_200_000_000, rate: 0.01, deduction: 2_400_000 },
  { min: 1_200_000_000, max: 2_500_000_000, rate: 0.02, deduction: 14_400_000 },
  { min: 2_500_000_000, max: 5_000_000_000, rate: 0.03, deduction: 39_400_000 },
  { min: 5_000_000_000, max: 9_400_000_000, rate: 0.04, deduction: 89_400_000 },
  { min: 9_400_000_000, max: Infinity, rate: 0.05, deduction: 183_400_000 },
] as const

// ---------------------------------------------------------------------------
// 5. 법인 세율
// ---------------------------------------------------------------------------

export const COMPREHENSIVE_TAX_CORPORATE_RATES = {
  /** 2주택 이하 법인: 2.7% 단일세율 */
  standard: 0.027,
  /** 3주택 이상 법인: 5.0% 단일세율 */
  multiHome: 0.05,
} as const

// ---------------------------------------------------------------------------
// 6. 세부담상한 (Tax Burden Cap)
// ---------------------------------------------------------------------------

/**
 * 세부담상한율: 150%
 *
 * (올해 재산세 + 종부세) <= (전년 재산세 + 종부세) x 150%
 * 초과분은 종부세에서 차감
 */
export const TAX_BURDEN_CAP_RATE = 1.50

// ---------------------------------------------------------------------------
// 7. 1세대 1주택 세액공제 (고령자 + 장기보유, 합산 최대 80%)
// ---------------------------------------------------------------------------

/**
 * 고령자 공제 (연령별)
 * | 연령        | 공제율 |
 * |------------|--------|
 * | 60세 이상   | 20%    |
 * | 65세 이상   | 30%    |
 * | 70세 이상   | 40%    |
 */
export const AGE_DEDUCTION_RATES = {
  under60: 0,
  age60to65: 0.2,
  age65to70: 0.3,
  over70: 0.4,
} as const

/**
 * 장기보유 공제 (보유기간별)
 * | 보유기간     | 공제율 |
 * |------------|--------|
 * | 5년 이상    | 20%    |
 * | 10년 이상   | 40%    |
 * | 15년 이상   | 50%    |
 */
export const HOLDING_DEDUCTION_RATES = {
  under5: 0,
  year5to10: 0.2,
  year10to15: 0.4,
  over15: 0.5,
} as const

/** 세액공제 합산 최대 한도: 80% */
export const MAX_COMBINED_DEDUCTION = 0.8

/**
 * 1세대 1주택 세액공제율 계산
 * @param age - 납세자 연령
 * @param holdingYears - 보유 연수
 * @returns 합산 공제율 (0 ~ 0.80)
 */
export const getSingleHomeDeductionRate = (
  age: number,
  holdingYears: number
): number => {
  let ageRate = 0
  if (age >= 70) ageRate = AGE_DEDUCTION_RATES.over70
  else if (age >= 65) ageRate = AGE_DEDUCTION_RATES.age65to70
  else if (age >= 60) ageRate = AGE_DEDUCTION_RATES.age60to65

  let holdingRate = 0
  if (holdingYears >= 15) holdingRate = HOLDING_DEDUCTION_RATES.over15
  else if (holdingYears >= 10) holdingRate = HOLDING_DEDUCTION_RATES.year10to15
  else if (holdingYears >= 5) holdingRate = HOLDING_DEDUCTION_RATES.year5to10

  return Math.min(ageRate + holdingRate, MAX_COMBINED_DEDUCTION)
}

// ---------------------------------------------------------------------------
// 8. 농어촌특별세
// ---------------------------------------------------------------------------

/** 농어촌특별세: 종부세 산출세액 (세부담상한 적용 후) x 20% */
export const RURAL_SPECIAL_TAX_ON_COMP_TAX = 0.2

// ---------------------------------------------------------------------------
// 9. 납부 일정
// ---------------------------------------------------------------------------

export const COMPREHENSIVE_TAX_PAYMENT = {
  /** 납부기한: 12/1 ~ 12/15 */
  month: 12,
  startDay: 1,
  endDay: 15,
  /** 분납 기준: 250만원 초과 시 분납 가능 */
  installmentThreshold: 2_500_000,
  /** 분납 납부기한: 다음해 6/15 */
  installmentDeadlineMonth: 6,
  installmentDeadlineDay: 15,
} as const

// ---------------------------------------------------------------------------
// 10. 계산 함수
// ---------------------------------------------------------------------------

/**
 * 종부세 과세표준에서 세액 산출
 * @param taxBase - 과세표준 (원)
 * @param brackets - 세율 구간 (일반 or 중과)
 */
export const getComprehensiveTaxFromBrackets = (
  taxBase: number,
  brackets: readonly ComprehensiveTaxBracket[] = COMPREHENSIVE_TAX_BRACKETS
): number => {
  if (taxBase <= 0) return 0
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxBase > brackets[i].min) {
      return taxBase * brackets[i].rate - brackets[i].deduction
    }
  }
  return 0
}

// ---------------------------------------------------------------------------
// 종합부동산세 전체 계산 흐름 (pseudocode)
// ---------------------------------------------------------------------------
//
// STEP 1: 과세표준
//   과세표준 = (소유 주택 공시가격 합계 - 기본공제) x 공정시장가액비율(60%)
//     - 1세대1주택: 기본공제 12억
//     - 일반/다주택: 기본공제 9억
//     - 법인: 기본공제 0
//
// STEP 2: 세율 적용
//   산출세액 = getComprehensiveTaxFromBrackets(과세표준, 세율구간)
//     - 2주택 이하: COMPREHENSIVE_TAX_BRACKETS (0.5%~2.7%)
//     - 3주택+: COMPREHENSIVE_TAX_BRACKETS_MULTI (0.5%~5.0%)
//
// STEP 3: 재산세 공제 (이중과세 조정)
//   공제 = 해당 주택 재산세 표준세율 산출 상당액
//
// STEP 4: 1세대1주택 세액공제
//   세액공제 = 산출세액 x getSingleHomeDeductionRate(age, holdingYears)
//   한도: 80%
//
// STEP 5: 세부담상한
//   (올해 재산세+종부세) <= (전년 재산세+종부세) x 150%
//
// STEP 6: 농어촌특별세 = 세부담상한 적용 후 종부세 x 20%
//
// STEP 7: 총 납부액 = 종부세 + 농어촌특별세
// ---------------------------------------------------------------------------
