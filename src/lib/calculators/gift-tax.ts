import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('gift-tax.ts')

export type DonorRelation =
  | 'spouse'
  | 'direct-ascendant'
  | 'direct-descendant'
  | 'relative'
  | 'other'

export interface GiftTaxInput {
  readonly giftValue: number
  readonly donorRelation: DonorRelation
}

export interface GiftTaxResult {
  readonly giftValue: number
  readonly exemptionLimit: number
  readonly taxableIncome: number
  readonly calculatedTax: number
  readonly reportingDiscount: number
  readonly finalTax: number
}

const inputSchema = z.object({
  giftValue: z.number().min(0, '증여재산가액은 0 이상이어야 합니다.'),
  donorRelation: z.enum([
    'spouse',
    'direct-ascendant',
    'direct-descendant',
    'relative',
    'other',
  ]),
})

const TAX_BRACKETS = [
  { limit: 100_000_000, rate: 0.1, deduction: 0 },
  { limit: 500_000_000, rate: 0.2, deduction: 10_000_000 },
  { limit: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
  { limit: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
  { limit: Infinity, rate: 0.5, deduction: 460_000_000 },
]

const EXEMPTION_LIMITS: Record<DonorRelation, number> = {
  spouse: 600_000_000,
  'direct-ascendant': 50_000_000,
  'direct-descendant': 50_000_000,
  relative: 10_000_000,
  other: 0,
}

const REPORTING_DISCOUNT_RATE = 0.03

export const calculateGiftTax = (input: GiftTaxInput): GiftTaxResult => {
  logger.logEntry('calculateGiftTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { giftValue, donorRelation } = validated

    // 면제한도
    const exemptionLimit = EXEMPTION_LIMITS[donorRelation]

    // 과세표준
    const taxableIncome = Math.max(0, giftValue - exemptionLimit)

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

    const result: GiftTaxResult = {
      giftValue,
      exemptionLimit,
      taxableIncome,
      calculatedTax,
      reportingDiscount,
      finalTax,
    }

    logger.logExit('calculateGiftTax', result)
    return result
  } catch (error) {
    logger.error('calculateGiftTax - error', error)
    throw error
  }
}
