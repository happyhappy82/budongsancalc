import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'
import {
  COMPREHENSIVE_TAX_DEDUCTIONS,
  COMPREHENSIVE_FAIR_MARKET_RATIO,
  RURAL_SPECIAL_TAX_ON_COMP_TAX,
  AGE_DEDUCTION_RATES,
  HOLDING_DEDUCTION_RATES,
  MAX_COMBINED_DEDUCTION,
  getComprehensiveTaxFromBrackets,
} from '@/lib/constants/comprehensive-tax-rates'

const logger = createLogger('comprehensive-tax.ts')

export interface ComprehensiveTaxInput {
  readonly totalAssessedValue: number // 주택 공시가격 합산
  readonly isSingleHomeOwner: boolean // 1세대1주택자 여부
  readonly ownerAge: number // 소유자 나이 (1세대1주택 공제용)
  readonly holdingYears: number // 보유기간 (1세대1주택 공제용)
}

export interface ComprehensiveTaxResult {
  readonly deduction: number // 기본공제
  readonly taxBase: number // 과세표준
  readonly calculatedTax: number // 산출세액
  readonly ageDeductionRate: number // 고령자 공제율
  readonly holdingDeductionRate: number // 장기보유 공제율
  readonly totalDeductionRate: number // 합산 공제율
  readonly taxDeduction: number // 세액공제
  readonly comprehensiveTax: number // 종합부동산세
  readonly localEducationTax: number // 지방교육세 (농특세 대체)
  readonly totalTax: number
  readonly effectiveRate: number
}

const inputSchema = z.object({
  totalAssessedValue: z.number().gt(0, '공시가격 합산액은 0보다 커야 합니다.'),
  isSingleHomeOwner: z.boolean(),
  ownerAge: z.number().min(0).max(120),
  holdingYears: z.number().min(0).max(100),
})

const getAgeDeductionRate = (age: number): number => {
  if (age >= 70) return AGE_DEDUCTION_RATES.over70
  if (age >= 65) return AGE_DEDUCTION_RATES.age65to70
  if (age >= 60) return AGE_DEDUCTION_RATES.age60to65
  return AGE_DEDUCTION_RATES.under60
}

const getHoldingDeductionRate = (years: number): number => {
  if (years >= 15) return HOLDING_DEDUCTION_RATES.over15
  if (years >= 10) return HOLDING_DEDUCTION_RATES.year10to15
  if (years >= 5) return HOLDING_DEDUCTION_RATES.year5to10
  return HOLDING_DEDUCTION_RATES.under5
}

export const calculateComprehensiveTax = (
  input: ComprehensiveTaxInput
): ComprehensiveTaxResult => {
  logger.logEntry('calculateComprehensiveTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { totalAssessedValue, isSingleHomeOwner, ownerAge, holdingYears } = validated

    const deduction = isSingleHomeOwner
      ? COMPREHENSIVE_TAX_DEDUCTIONS.singleHomeOwner
      : COMPREHENSIVE_TAX_DEDUCTIONS.general

    const taxableValue = Math.max(0, totalAssessedValue - deduction)
    const taxBase = roundToWon(taxableValue * COMPREHENSIVE_FAIR_MARKET_RATIO)

    const calculatedTax = roundToWon(getComprehensiveTaxFromBrackets(taxBase))

    // 1세대1주택 세액공제 (고령자 + 장기보유)
    let ageDeductionRate = 0
    let holdingDeductionRate = 0
    let totalDeductionRate = 0
    let taxDeduction = 0

    if (isSingleHomeOwner) {
      ageDeductionRate = getAgeDeductionRate(ownerAge)
      holdingDeductionRate = getHoldingDeductionRate(holdingYears)
      totalDeductionRate = Math.min(
        ageDeductionRate + holdingDeductionRate,
        MAX_COMBINED_DEDUCTION
      )
      taxDeduction = roundToWon(calculatedTax * totalDeductionRate)
    }

    const comprehensiveTax = calculatedTax - taxDeduction

    const localEducationTax = roundToWon(
      comprehensiveTax * RURAL_SPECIAL_TAX_ON_COMP_TAX
    )

    const totalTax = comprehensiveTax + localEducationTax
    const effectiveRate =
      totalAssessedValue > 0 ? (totalTax / totalAssessedValue) * 100 : 0

    const result: ComprehensiveTaxResult = {
      deduction,
      taxBase,
      calculatedTax,
      ageDeductionRate: Math.round(ageDeductionRate * 100),
      holdingDeductionRate: Math.round(holdingDeductionRate * 100),
      totalDeductionRate: Math.round(totalDeductionRate * 100),
      taxDeduction,
      comprehensiveTax,
      localEducationTax,
      totalTax,
      effectiveRate: Math.round(effectiveRate * 1000) / 1000,
    }

    logger.logExit('calculateComprehensiveTax', result)
    return result
  } catch (error) {
    logger.error('calculateComprehensiveTax - error', error)
    throw error
  }
}
