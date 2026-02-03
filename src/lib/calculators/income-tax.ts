import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('income-tax.ts')

export interface IncomeTaxInput {
  readonly rentalIncome: number
  readonly otherIncome: number
  readonly expenses: number
  readonly dependents: number
}

export interface IncomeTaxResult {
  readonly totalIncome: number
  readonly taxableIncome: number
  readonly calculatedTax: number
  readonly localIncomeTax: number
  readonly totalTax: number
  readonly effectiveRate: number
}

const inputSchema = z.object({
  rentalIncome: z.number().min(0, '임대소득은 0 이상이어야 합니다.'),
  otherIncome: z.number().min(0, '기타소득은 0 이상이어야 합니다.'),
  expenses: z.number().min(0, '필요경비는 0 이상이어야 합니다.'),
  dependents: z.number().int().min(0, '부양가족수는 0 이상의 정수여야 합니다.'),
})

const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06, deduction: 0 },
  { limit: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity, rate: 0.45, deduction: 65_940_000 },
]

const BASIC_DEDUCTION_PER_PERSON = 1_500_000

export const calculateIncomeTax = (input: IncomeTaxInput): IncomeTaxResult => {
  logger.logEntry('calculateIncomeTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { rentalIncome, otherIncome, expenses, dependents } = validated

    // 종합소득금액 = 임대소득 + 기타소득 - 필요경비
    const totalIncome = rentalIncome + otherIncome - expenses

    // 기본공제 (본인 + 부양가족)
    const basicDeduction = BASIC_DEDUCTION_PER_PERSON * (1 + dependents)

    // 과세표준 = 종합소득금액 - 기본공제
    const taxableIncome = Math.max(0, totalIncome - basicDeduction)

    // 누진세 계산
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

    // 지방소득세 (10%)
    const localIncomeTax = roundToWon(calculatedTax * 0.1)

    // 총 세액
    const totalTax = calculatedTax + localIncomeTax

    // 실효세율
    const effectiveRate =
      totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0

    const result: IncomeTaxResult = {
      totalIncome,
      taxableIncome,
      calculatedTax,
      localIncomeTax,
      totalTax,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
    }

    logger.logExit('calculateIncomeTax', result)
    return result
  } catch (error) {
    logger.error('calculateIncomeTax - error', error)
    throw error
  }
}
