import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('savings-interest.ts')

export type InterestType = 'simple' | 'compound'
export type TaxType = 'general' | 'preferential' | 'tax-free'

export interface SavingsInterestInput {
  readonly principal: number
  readonly annualRate: number
  readonly months: number
  readonly interestType: InterestType
  readonly taxType: TaxType
}

export interface SavingsInterestResult {
  readonly interestBeforeTax: number
  readonly interestTax: number
  readonly interestAfterTax: number
  readonly totalAfterTax: number
}

const schema = z.object({
  principal: z.number().gt(0, '원금은 0보다 커야 합니다.'),
  annualRate: z.number().min(0, '연이율은 0 이상이어야 합니다.'),
  months: z.number().gt(0, '기간은 0보다 커야 합니다.'),
  interestType: z.enum(['simple', 'compound']),
  taxType: z.enum(['general', 'preferential', 'tax-free']),
})

const TAX_RATES = {
  general: 0.154,
  preferential: 0.095,
  'tax-free': 0,
} as const

export const calculateSavingsInterest = (input: SavingsInterestInput): SavingsInterestResult => {
  logger.logEntry('calculateSavingsInterest', { ...input })

  try {
    const validated = schema.parse(input)

    const rate = validated.annualRate / 100
    const years = validated.months / 12

    let interestBeforeTax: number

    if (validated.interestType === 'simple') {
      interestBeforeTax = validated.principal * rate * years
    } else {
      const compoundFactor = Math.pow(1 + rate / 12, validated.months)
      interestBeforeTax = validated.principal * compoundFactor - validated.principal
    }

    const taxRate = TAX_RATES[validated.taxType]
    const interestTax = interestBeforeTax * taxRate
    const interestAfterTax = interestBeforeTax - interestTax
    const totalAfterTax = validated.principal + interestAfterTax

    const result: SavingsInterestResult = {
      interestBeforeTax: roundToWon(interestBeforeTax),
      interestTax: roundToWon(interestTax),
      interestAfterTax: roundToWon(interestAfterTax),
      totalAfterTax: roundToWon(totalAfterTax),
    }

    logger.logExit('calculateSavingsInterest', result)
    return result
  } catch (error) {
    logger.error('calculateSavingsInterest - error', error)
    throw error
  }
}
