import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('progressive-tax.ts')

export interface ProgressiveTaxInput {
  readonly taxableIncome: number
}

export interface TaxBracket {
  readonly bracket: string
  readonly taxableAmount: number
  readonly rate: number
  readonly taxAmount: number
}

export interface ProgressiveTaxResult {
  readonly brackets: readonly TaxBracket[]
  readonly totalTax: number
  readonly effectiveRate: number
}

const inputSchema = z.object({
  taxableIncome: z.number().min(0, '과세표준은 0 이상이어야 합니다.'),
})

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, name: '1,400만원 이하' },
  { limit: 50_000_000, rate: 0.15, name: '5,000만원 이하' },
  { limit: 88_000_000, rate: 0.24, name: '8,800만원 이하' },
  { limit: 150_000_000, rate: 0.35, name: '1억 5,000만원 이하' },
  { limit: 300_000_000, rate: 0.38, name: '3억원 이하' },
  { limit: 500_000_000, rate: 0.4, name: '5억원 이하' },
  { limit: 1_000_000_000, rate: 0.42, name: '10억원 이하' },
  { limit: Infinity, rate: 0.45, name: '10억원 초과' },
]

export const calculateProgressiveTax = (
  input: ProgressiveTaxInput
): ProgressiveTaxResult => {
  logger.logEntry('calculateProgressiveTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { taxableIncome } = validated

    const brackets: TaxBracket[] = []
    let remainingIncome = taxableIncome
    let totalTax = 0
    let previousLimit = 0

    for (const bracket of TAX_BRACKETS) {
      if (remainingIncome <= 0) break

      const bracketLimit = bracket.limit - previousLimit
      const taxableAmount = Math.min(remainingIncome, bracketLimit)
      const taxAmount = roundToWon(taxableAmount * bracket.rate)

      brackets.push({
        bracket: bracket.name,
        taxableAmount,
        rate: bracket.rate * 100,
        taxAmount,
      })

      totalTax += taxAmount
      remainingIncome -= taxableAmount
      previousLimit = bracket.limit

      if (bracket.limit === Infinity) break
    }

    const effectiveRate =
      taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0

    const result: ProgressiveTaxResult = {
      brackets,
      totalTax,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
    }

    logger.logExit('calculateProgressiveTax', result)
    return result
  } catch (error) {
    logger.error('calculateProgressiveTax - error', error)
    throw error
  }
}
