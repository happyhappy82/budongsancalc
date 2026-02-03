import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('rental-income-tax.ts')

export interface RentalIncomeTaxInput {
  readonly monthlyRent: number
  readonly deposit: number
  readonly rentalMonths: number
  readonly isRegistered: boolean
}

export interface RentalIncomeTaxResult {
  readonly annualIncome: number
  readonly expenses: number
  readonly basicDeduction: number
  readonly taxableIncome: number
  readonly calculatedTax: number
}

const inputSchema = z.object({
  monthlyRent: z.number().min(0, '월세수입은 0 이상이어야 합니다.'),
  deposit: z.number().min(0, '보증금은 0 이상이어야 합니다.'),
  rentalMonths: z.number().int().gt(0, '임대기간은 0보다 커야 합니다.'),
  isRegistered: z.boolean(),
})

const SEPARATE_TAX_RATE = 0.14
const REGISTERED_EXPENSE_RATE = 0.6
const UNREGISTERED_EXPENSE_RATE = 0.5
const REGISTERED_BASIC_DEDUCTION = 4_000_000
const UNREGISTERED_BASIC_DEDUCTION = 2_000_000

export const calculateRentalIncomeTax = (
  input: RentalIncomeTaxInput
): RentalIncomeTaxResult => {
  logger.logEntry('calculateRentalIncomeTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { monthlyRent, rentalMonths, isRegistered } = validated

    // 연간 수입금액 (월세 기준)
    const annualIncome = roundToWon((monthlyRent * rentalMonths * 12) / rentalMonths)

    // 필요경비율 적용
    const expenseRate = isRegistered
      ? REGISTERED_EXPENSE_RATE
      : UNREGISTERED_EXPENSE_RATE
    const expenses = roundToWon(annualIncome * expenseRate)

    // 기본공제
    const basicDeduction = isRegistered
      ? REGISTERED_BASIC_DEDUCTION
      : UNREGISTERED_BASIC_DEDUCTION

    // 과세표준 = 수입금액 - 필요경비 - 기본공제
    const taxableIncome = Math.max(0, annualIncome - expenses - basicDeduction)

    // 산출세액 (분리과세 14%)
    const calculatedTax = roundToWon(taxableIncome * SEPARATE_TAX_RATE)

    const result: RentalIncomeTaxResult = {
      annualIncome,
      expenses,
      basicDeduction,
      taxableIncome,
      calculatedTax,
    }

    logger.logExit('calculateRentalIncomeTax', result)
    return result
  } catch (error) {
    logger.error('calculateRentalIncomeTax - error', error)
    throw error
  }
}
