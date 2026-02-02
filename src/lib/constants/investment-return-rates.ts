// =============================================================================
// 투자 수익률 (Investment Return Rate) - Korean Real Estate
// =============================================================================
// Formulas for calculating real estate investment returns including:
//   - Cap Rate (자본환원율)
//   - ROI (투자수익률)
//   - Leverage Effect (레버리지 효과)
//   - Rental Yield (임대수익률)
//   - Total Return (종합수익률)
// Last verified: 2025-01
// =============================================================================

// ---------------------------------------------------------------------------
// 1. 취득세 관련 상수 (for ROI total cost calculation)
// ---------------------------------------------------------------------------

/**
 * 취득세 세율 (주택)
 * 실제 취득세는 acquisition-tax-rates.ts에 정의
 * 여기서는 ROI 시뮬레이션용 기본값만 제공
 */
export const ACQUISITION_COST_DEFAULTS = {
  /** 1주택 기본 취득세율 (6억 이하): 1.1% (취득세 1% + 지방교육세 0.1%) */
  singleHomeLow: 0.011,
  /** 1주택 고가 (9억 초과): 3.5% (취득세 3% + 지방교육세 0.3% + 농특세 0.2%) */
  singleHomeHigh: 0.035,
  /** 조정지역 2주택: 8.4% (취득세 8% + 지방교육세 0.4%) */
  regulated2Home: 0.084,
  /** 조정지역 3주택+: 12.4% (취득세 12% + 지방교육세 0.4%) */
  regulated3PlusHome: 0.124,
  /** 법무사 수수료 (추정): 매매가의 약 0.1% */
  legalFeeRate: 0.001,
  /** 중개수수료 상한 (매매가 구간별, 9억 이상): 0.5% */
  brokerageFeeRateHigh: 0.005,
  /** 중개수수료 상한 (매매가 구간별, 6~9억): 0.4% */
  brokerageFeeRateMid: 0.004,
  /** 중개수수료 상한 (매매가 구간별, 2~6억): 0.3% */
  brokerageFeeRateLow: 0.003,
} as const

// ---------------------------------------------------------------------------
// 2. 양도세 관련 상수 (for ROI exit cost calculation)
// ---------------------------------------------------------------------------

/**
 * 양도소득세 기본세율 (2년 이상 보유, 기본세율 6%~45%)
 * 실제 세율표는 transfer-tax-rates.ts에 정의
 * 장기보유특별공제는 long-term-deduction.ts에 정의
 */
export const TRANSFER_TAX_DEFAULTS = {
  /** 1세대 1주택 비과세 기준: 12억원 */
  exemptionThreshold: 1_200_000_000,
  /** 다주택 중과 유예: 2026-05-09까지 */
  multiHomeSurchargeEndDate: '2026-05-09',
  /** 지방소득세: 양도소득세의 10% */
  localIncomeTaxRate: 0.10,
} as const

// ---------------------------------------------------------------------------
// 3. 보유세 관련 (연간 비용, for ROI annual cost calculation)
// ---------------------------------------------------------------------------

/**
 * 연간 보유비용 추정용 비율 (매매가 대비)
 * 실제 계산은 property-tax-rates.ts / comprehensive-tax-rates.ts 사용
 */
export const ANNUAL_HOLDING_COST_ESTIMATES = {
  /** 재산세+도시지역분+지방교육세: 대략 공시가격의 0.1~0.5% */
  propertyTaxEstimateRange: { min: 0.001, max: 0.005 },
  /** 종부세 (해당 시): 추가 0.5~2.7% (과세표준 기준) */
  comprehensiveTaxRange: { min: 0.005, max: 0.027 },
  /** 건물 관리비/수선비 추정: 연간 매매가의 약 0.5~1.0% */
  maintenanceCostRange: { min: 0.005, max: 0.01 },
  /** 보험료 추정: 연간 매매가의 약 0.05~0.1% */
  insuranceCostRange: { min: 0.0005, max: 0.001 },
} as const

// ---------------------------------------------------------------------------
// 4. 임대수익률 계산 공식
// ---------------------------------------------------------------------------

/**
 * 전월세전환율 (임대차3법 기준 상한)
 * 전환율 = 한국은행 기준금리 + 대통령령이 정하는 이율(현재 2.0%)
 * 2025년 1월 기준 기준금리 3.0% -> 상한 5.0%
 */
export const RENT_CONVERSION_RATE_MARKUP = 0.02 // 기준금리에 더하는 비율

/**
 * 전월세전환율 공식
 *
 * 전월세전환율(%) = (월세 x 12) / (전세보증금 - 월세보증금) x 100
 *
 * @param monthlyRent - 월세 (원)
 * @param jeonseDeposit - 전세보증금 (원)
 * @param monthlyDeposit - 월세보증금 (원)
 */
export const calculateRentConversionRate = (
  monthlyRent: number,
  jeonseDeposit: number,
  monthlyDeposit: number
): number => {
  const depositDifference = jeonseDeposit - monthlyDeposit
  if (depositDifference <= 0) return 0
  return (monthlyRent * 12) / depositDifference
}

/**
 * 총 임대수익률 (Gross Rental Yield)
 *
 * 공식: (연간 임대수입 / 총 투자금) x 100
 * 연간 임대수입 = (월세 x 12) + 보증금운용수익
 * 총 투자금 = 매매가 + 취득세 + 부대비용 - 대출금 - 보증금
 *
 * @param annualRentalIncome - 연간 임대수입 (원)
 * @param totalInvestment - 총 투자금 (원)
 */
export const calculateGrossRentalYield = (
  annualRentalIncome: number,
  totalInvestment: number
): number => {
  if (totalInvestment <= 0) return 0
  return annualRentalIncome / totalInvestment
}

/**
 * 순 임대수익률 (Net Rental Yield)
 *
 * 공식: (연간 순수입 / 총 투자금) x 100
 * 연간 순수입 = 연간 임대수입 - 공실손실 - 관리비 - 보유세 - 수선비 - 보험료
 *
 * @param annualRentalIncome - 연간 총 임대수입 (원)
 * @param annualExpenses - 연간 총 비용 (원): 관리비 + 보유세 + 수선비 등
 * @param vacancyRate - 공실률 (0~1)
 * @param totalInvestment - 총 투자금 (원)
 */
export const calculateNetRentalYield = (
  annualRentalIncome: number,
  annualExpenses: number,
  vacancyRate: number,
  totalInvestment: number
): number => {
  if (totalInvestment <= 0) return 0
  const effectiveIncome = annualRentalIncome * (1 - vacancyRate)
  return (effectiveIncome - annualExpenses) / totalInvestment
}

// ---------------------------------------------------------------------------
// 5. Cap Rate (자본환원율) 계산
// ---------------------------------------------------------------------------

/**
 * NOI (순영업소득, Net Operating Income)
 *
 * NOI = 유효총수입(EGI) - 운영경비(OPEX)
 *   유효총수입 = (임대료 + 관리비수입 + 보증금운용수익) x (1 - 공실률)
 *   운영경비 = 관리비 + 수선유지비 + 보험료 + 재산세 등 (대출상환 제외)
 *
 * @param effectiveGrossIncome - 유효총수입 (원)
 * @param operatingExpenses - 운영경비 (원) - 대출상환 미포함
 */
export const calculateNOI = (
  effectiveGrossIncome: number,
  operatingExpenses: number
): number => {
  return effectiveGrossIncome - operatingExpenses
}

/**
 * Cap Rate (자본환원율)
 *
 * Cap Rate = NOI / 부동산 매입가격(또는 시장가격)
 *
 * 용도: 대출 등 외부요인을 배제한 부동산 자체의 순수 수익성
 *
 * @param noi - 순영업소득 (원/년)
 * @param propertyPrice - 부동산 가격 (원)
 */
export const calculateCapRate = (
  noi: number,
  propertyPrice: number
): number => {
  if (propertyPrice <= 0) return 0
  return noi / propertyPrice
}

/**
 * Cap Rate을 이용한 적정 부동산 가격 역산
 *
 * 적정가격 = NOI / Cap Rate
 *
 * @param noi - 순영업소득 (원/년)
 * @param capRate - 목표 Cap Rate (소수)
 */
export const calculatePropertyValueFromCapRate = (
  noi: number,
  capRate: number
): number => {
  if (capRate <= 0) return 0
  return noi / capRate
}

// ---------------------------------------------------------------------------
// 6. ROI (투자수익률) 계산
// ---------------------------------------------------------------------------

/**
 * 세전 현금흐름 (Cash Flow Before Tax)
 *
 * CFBT = NOI - 연간 대출원리금상환액(DS: Debt Service)
 *
 * @param noi - 순영업소득 (원/년)
 * @param annualDebtService - 연간 대출원리금 (원)
 */
export const calculateCashFlowBeforeTax = (
  noi: number,
  annualDebtService: number
): number => {
  return noi - annualDebtService
}

/**
 * 자기자본수익률 (Cash-on-Cash ROI / Equity ROI)
 *
 * ROI = Cash Flow / 자기자본(실제 투자금)
 *
 * 자기자본 = 매매가 - 대출금 + 취득비용(취득세, 중개수수료, 법무사비 등)
 *          - 임대보증금(레버리지로 간주 가능)
 *
 * @param annualCashFlow - 연간 세전현금흐름 (원)
 * @param equityInvested - 자기자본 투자금 (원)
 */
export const calculateEquityROI = (
  annualCashFlow: number,
  equityInvested: number
): number => {
  if (equityInvested <= 0) return 0
  return annualCashFlow / equityInvested
}

/**
 * 종합 투자수익률 (Total Return Rate)
 * 임대수익 + 자본이득(시세차익) 모두 포함
 *
 * 총수익률 = (연간 순임대수입 + 연간 자본이득) / 총 투자금
 *
 * 연환산 시:
 * 총수익률(연환산) = ((매도가 - 매입가 - 양도세 - 매도비용 + 순임대수입 누적) / 총투자금)
 *                   / 보유연수
 *
 * @param netRentalIncome - 보유기간 동안 순임대수입 누적 (원)
 * @param capitalGainAfterTax - 양도차익(세후) (원)
 * @param totalInvestment - 총 투자금 (원)
 * @param holdingYears - 보유 연수
 */
export const calculateTotalReturnRate = (
  netRentalIncome: number,
  capitalGainAfterTax: number,
  totalInvestment: number,
  holdingYears: number
): number => {
  if (totalInvestment <= 0 || holdingYears <= 0) return 0
  return (netRentalIncome + capitalGainAfterTax) / totalInvestment / holdingYears
}

// ---------------------------------------------------------------------------
// 7. 레버리지 효과 (Leverage Effect)
// ---------------------------------------------------------------------------

/**
 * 레버리지 자기자본수익률 공식
 *
 * 자기자본수익률 = 임대수익률 + (임대수익률 - 대출이자율) x (차입금 / 자기자본)
 *
 * - 임대수익률 > 이자율 -> 정(正)의 레버리지 (수익률 증대)
 * - 임대수익률 < 이자율 -> 부(負)의 레버리지 (수익률 감소)
 * - 임대수익률 = 이자율 -> 중립 레버리지 (레버리지 효과 없음)
 *
 * @param rentalYield - 임대수익률 (소수, Cap Rate 기준)
 * @param interestRate - 대출 이자율 (소수)
 * @param loanAmount - 대출금 (원)
 * @param equity - 자기자본 (원)
 */
export const calculateLeverageROI = (
  rentalYield: number,
  interestRate: number,
  loanAmount: number,
  equity: number
): number => {
  if (equity <= 0) return 0
  const leverageRatio = loanAmount / equity
  return rentalYield + (rentalYield - interestRate) * leverageRatio
}

/**
 * 자본이득 레버리지 수익률
 * 부동산 가격 변동에 대한 자기자본 수익률
 *
 * 자기자본 수익률 = (가격변동액 / 자기자본) x 100
 *
 * 예: LTV 80%, 가격 20% 상승 -> 자기자본 수익률 100%
 *     LTV 80%, 가격 20% 하락 -> 자기자본 수익률 -100%
 *
 * @param priceChangeRate - 부동산 가격 변동률 (소수, 0.2 = 20% 상승)
 * @param ltv - LTV 비율 (소수, 0.7 = 70%)
 */
export const calculateCapitalGainLeverage = (
  priceChangeRate: number,
  ltv: number
): number => {
  const equityRatio = 1 - ltv
  if (equityRatio <= 0) return 0
  return priceChangeRate / equityRatio
}

// ---------------------------------------------------------------------------
// 8. 종합 투자 분석 입출력 타입
// ---------------------------------------------------------------------------

export interface InvestmentInput {
  /** 매매가 (원) */
  purchasePrice: number
  /** 공시가격 (원) - 보유세 계산용 */
  publishedPrice: number
  /** 대출금 (원) */
  loanAmount: number
  /** 대출 연이자율 (소수) */
  interestRate: number
  /** 임대보증금 (원) */
  rentalDeposit: number
  /** 월세 (원) */
  monthlyRent: number
  /** 예상 보유기간 (년) */
  holdingYears: number
  /** 예상 연간 시세상승률 (소수) */
  annualAppreciationRate: number
  /** 공실률 (소수) */
  vacancyRate: number
  /** 주택 수 (1, 2, 3+) */
  homeCount: number
  /** 취득세 총액 (원) - 외부에서 계산해서 입력 */
  acquisitionTax: number
  /** 연간 보유세 총액 (원) - 외부에서 계산해서 입력 */
  annualHoldingTax: number
  /** 연간 관리비/수선비 (원) */
  annualMaintenanceCost: number
}

export interface InvestmentResult {
  /** 총 투자금 (자기자본) */
  totalEquity: number
  /** 연간 총 임대수입 */
  annualGrossRentalIncome: number
  /** NOI (순영업소득) */
  noi: number
  /** Cap Rate */
  capRate: number
  /** 연간 세전현금흐름 */
  annualCashFlowBeforeTax: number
  /** 자기자본수익률 (Cash-on-Cash) */
  cashOnCashReturn: number
  /** 레버리지 수익률 */
  leveragedReturn: number
  /** 예상 매도가 */
  expectedSalePrice: number
  /** 종합수익률(연환산) */
  totalReturnRate: number
}

// ---------------------------------------------------------------------------
// 종합 수익률 계산 흐름 (pseudocode)
// ---------------------------------------------------------------------------
//
// STEP 1: 총 투자금(자기자본) 산정
//   자기자본 = 매매가 - 대출금 - 보증금 + 취득세 + 부대비용
//
// STEP 2: 연간 임대수입
//   연간 총 임대수입 = 월세 x 12
//   보증금 운용수익 = 보증금 x 보증금운용이율 (통상 은행금리)
//   유효총수입(EGI) = (임대수입 + 보증금운용수익) x (1 - 공실률)
//
// STEP 3: 연간 비용
//   운영비용 = 관리비 + 수선비 + 보험 + 보유세(재산세+종부세)
//   대출원리금 = 연간 원리금 상환액
//
// STEP 4: NOI = EGI - 운영비용
//   Cap Rate = NOI / 매매가
//
// STEP 5: 세전현금흐름 = NOI - 대출원리금
//   Cash-on-Cash ROI = 세전현금흐름 / 자기자본
//
// STEP 6: 레버리지 수익률
//   = Cap Rate + (Cap Rate - 이자율) x (대출금 / 자기자본)
//
// STEP 7: 매도 시 종합수익률
//   예상매도가 = 매매가 x (1 + 연상승률) ^ 보유년
//   양도차익 = 매도가 - 매입가 - 필요경비
//   양도소득세 = transfer-tax 계산기 사용
//   순매도수익 = 양도차익 - 양도세 - 대출잔금
//   총수익 = 순매도수익 + (세전현금흐름 x 보유년)
//   종합수익률(연환산) = 총수익 / 자기자본 / 보유년
// ---------------------------------------------------------------------------
