import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('inheritance-tax.ts')

export interface InheritanceTaxInput {
  readonly estateValue: number
  readonly hasSpouse: boolean
  readonly childrenCount: number
  readonly debtAmount: number
}

export interface InheritanceTaxResult {
  readonly estateValue: number
  readonly totalDeduction: number
  readonly taxableIncome: number
  readonly calculatedTax: number
  readonly reportingDiscount: number
  readonly finalTax: number
}

const inputSchema = z.object({
  estateValue: z.number().min(0, '상속재산가액은 0 이상이어야 합니다.'),
  hasSpouse: z.boolean(),
  childrenCount: z.number().int().min(0, '자녀수는 0 이상의 정수여야 합니다.'),
  debtAmount: z.number().min(0, '채무액은 0 이상이어야 합니다.'),
})

const TAX_BRACKETS = [
  { limit: 100_000_000, rate: 0.1, deduction: 0 },
  { limit: 500_000_000, rate: 0.2, deduction: 10_000_000 },
  { limit: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
  { limit: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
  { limit: Infinity, rate: 0.5, deduction: 460_000_000 },
]

const BASIC_DEDUCTION = 200_000_000
const LUMP_SUM_DEDUCTION = 500_000_000
const SPOUSE_DEDUCTION = 500_000_000
const REPORTING_DISCOUNT_RATE = 0.03

export const calculateInheritanceTax = (
  input: InheritanceTaxInput
): InheritanceTaxResult => {
  logger.logEntry('calculateInheritanceTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { estateValue, hasSpouse, debtAmount } = validated

    // 상속재산가액 (채무 차감)
    const netEstateValue = Math.max(0, estateValue - debtAmount)

    // 공제액 계산 (일괄공제 vs 기초공제+배우자공제)
    const basicWithSpouse = BASIC_DEDUCTION + (hasSpouse ? SPOUSE_DEDUCTION : 0)
    const totalDeduction = Math.max(LUMP_SUM_DEDUCTION, basicWithSpouse)

    // 과세표준
    const taxableIncome = Math.max(0, netEstateValue - totalDeduction)

    // 산출세액 (누진세)
    let calculatedTax = 0
    for (const bracket of TAX_BRACKETS) {
      if (taxableIncome <= bracket.limit) {
        calculatedTax = roundToWon(
          taxableIncome * bracket.rate - bracket.deduction
        )
        break
      }
    }

    calculatedTax = Math.max(0, calculatedTax)

    // 신고세액공제 (3%)
    const reportingDiscount = roundToWon(calculatedTax * REPORTING_DISCOUNT_RATE)

    // 최종 납부세액
    const finalTax = calculatedTax - reportingDiscount

    const result: InheritanceTaxResult = {
      estateValue: netEstateValue,
      totalDeduction,
      taxableIncome,
      calculatedTax,
      reportingDiscount,
      finalTax,
    }

    logger.logExit('calculateInheritanceTax', result)
    return result
  } catch (error) {
    logger.error('calculateInheritanceTax - error', error)
    throw error
  }
}
