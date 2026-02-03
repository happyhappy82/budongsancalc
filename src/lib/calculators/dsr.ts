import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo, calculateMonthlyRate } from '@/lib/utils/math'

const logger = createLogger('dsr.ts')

export interface DsrInput {
  readonly annualIncome: number
  readonly loanAmount: number
  readonly loanTermMonths: number
  readonly loanRate: number
  readonly repaymentMethod: '원리금균등' | '원금균등' | '만기일시'
  readonly otherDebtAmount: number
  readonly otherDebtRate: number
  readonly stressRate: number
}

export interface DsrResult {
  readonly dsrRate: number
  readonly annualTotalRepay: number
  readonly loanAnnualRepay: number
  readonly otherDebtAnnualRepay: number
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
  stressRate: z.number().gte(0, '스트레스금리는 0 이상이어야 합니다.'),
})

const calculateMonthlyPayment = (
  loanAmount: number,
  loanTermMonths: number,
  loanRate: number,
  stressRate: number,
  repaymentMethod: '원리금균등' | '원금균등' | '만기일시'
): number => {
  const totalRate = loanRate + stressRate
  const monthlyRate = calculateMonthlyRate(totalRate)

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

export const calculateDsr = (input: DsrInput): DsrResult => {
  logger.logEntry('calculateDsr', { ...input })

  try {
    const validated = schema.parse(input)

    // Calculate monthly loan payment
    const monthlyRepay = calculateMonthlyPayment(
      validated.loanAmount,
      validated.loanTermMonths,
      validated.loanRate,
      validated.stressRate,
      validated.repaymentMethod
    )

    // Calculate annual loan repayment
    const loanAnnualRepay = roundToWon(monthlyRepay * 12)

    // Calculate annual other debt repayment (principal + interest for DSR)
    const otherDebtAnnualRepay = roundToWon(
      validated.otherDebtAmount * (validated.otherDebtRate / 100)
    )

    // Total annual repayment
    const annualTotalRepay = loanAnnualRepay + otherDebtAnnualRepay

    // DSR rate
    const dsrRate = roundTo((annualTotalRepay / validated.annualIncome) * 100, 2)

    const result: DsrResult = {
      dsrRate,
      annualTotalRepay,
      loanAnnualRepay,
      otherDebtAnnualRepay,
      monthlyRepay: roundToWon(monthlyRepay),
    }

    logger.logExit('calculateDsr', result)
    return result
  } catch (error) {
    logger.error('calculateDsr - error', error)
    throw error
  }
}
