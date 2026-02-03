import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo, calculateMonthlyRate } from '@/lib/utils/math'

const logger = createLogger('dti.ts')

export interface DtiInput {
  readonly annualIncome: number
  readonly loanAmount: number
  readonly loanTermMonths: number
  readonly loanRate: number
  readonly repaymentMethod: '원리금균등' | '원금균등' | '만기일시'
  readonly otherDebtAmount: number
  readonly otherDebtRate: number
}

export interface DtiResult {
  readonly dtiRate: number
  readonly annualTotalRepay: number
  readonly loanAnnualRepay: number
  readonly otherDebtAnnualInterest: number
  readonly monthlyRepay: number
}

const schema = z.object({
  annualIncome: z.number().gt(0, '연소득은 0보다 커야 합니다.'),
  loanAmount: z.number().gte(0, '대출금액은 0 이상이어야 합니다.'),
  loanTermMonths: z.number().int().gt(0, '대출기간은 0보다 큰 정수여야 합니다.'),
  loanRate: z.number().gte(0, '대출이율은 0 이상이어야 합니다.'),
  repaymentMethod: z.enum(['원리금균등', '원금균등', '만기일시']),
  otherDebtAmount: z.number().gte(0, '기타부채금액은 0 이상이어야 합니다.'),
  otherDebtRate: z.number().gte(0, '기타부채이율은 0 이상이어야 합니다.'),
})

const calculateMonthlyPayment = (
  loanAmount: number,
  loanTermMonths: number,
  loanRate: number,
  repaymentMethod: '원리금균등' | '원금균등' | '만기일시'
): number => {
  const monthlyRate = calculateMonthlyRate(loanRate)

  if (repaymentMethod === '원리금균등') {
    // 원리금균등: monthly = loanAmount * monthlyRate * (1+monthlyRate)^n / ((1+monthlyRate)^n - 1)
    const pow = Math.pow(1 + monthlyRate, loanTermMonths)
    return (loanAmount * monthlyRate * pow) / (pow - 1)
  } else if (repaymentMethod === '원금균등') {
    // 원금균등: monthly = loanAmount/n + loanAmount * monthlyRate (first month)
    return loanAmount / loanTermMonths + loanAmount * monthlyRate
  } else {
    // 만기일시: monthly interest only
    return loanAmount * monthlyRate
  }
}

export const calculateDti = (input: DtiInput): DtiResult => {
  logger.logEntry('calculateDti', { ...input })

  try {
    const validated = schema.parse(input)

    // Calculate monthly loan payment (no stress rate for DTI)
    const monthlyRepay = calculateMonthlyPayment(
      validated.loanAmount,
      validated.loanTermMonths,
      validated.loanRate,
      validated.repaymentMethod
    )

    // Calculate annual loan repayment (principal + interest)
    const loanAnnualRepay = roundToWon(monthlyRepay * 12)

    // Calculate annual other debt interest ONLY (not principal)
    const otherDebtAnnualInterest = roundToWon(
      validated.otherDebtAmount * (validated.otherDebtRate / 100)
    )

    // Total annual repayment (loan principal+interest + other debt interest)
    const annualTotalRepay = loanAnnualRepay + otherDebtAnnualInterest

    // DTI rate
    const dtiRate = roundTo((annualTotalRepay / validated.annualIncome) * 100, 2)

    const result: DtiResult = {
      dtiRate,
      annualTotalRepay,
      loanAnnualRepay,
      otherDebtAnnualInterest,
      monthlyRepay: roundToWon(monthlyRepay),
    }

    logger.logExit('calculateDti', result)
    return result
  } catch (error) {
    logger.error('calculateDti - error', error)
    throw error
  }
}
