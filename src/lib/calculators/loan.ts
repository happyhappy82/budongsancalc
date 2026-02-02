import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, calculateMonthlyRate } from '@/lib/utils/math'
import { LTV_LIMITS, DSR_LIMITS, STRESS_DSR } from '@/lib/constants/loan-regulations'
import type { RepaymentMethod } from '@/lib/types/calculator'

const logger = createLogger('loan.ts')

export interface LoanInput {
  readonly loanAmount: number
  readonly annualRate: number
  readonly loanTermYears: number
  readonly repaymentMethod: RepaymentMethod
}

export interface MonthlySchedule {
  readonly month: number
  readonly principal: number
  readonly interest: number
  readonly payment: number
  readonly remainingBalance: number
}

export interface LoanResult {
  readonly monthlyPayment: number
  readonly totalPayment: number
  readonly totalInterest: number
  readonly schedule: readonly MonthlySchedule[]
}

export interface LtvDtiDsrInput {
  readonly propertyValue: number
  readonly annualIncome: number
  readonly otherDebtPayment: number
  readonly region: 'capital' | 'non-capital'
  readonly isFirstTimeBuyer: boolean
  readonly financialInstitution: 'first' | 'second'
}

export interface LtvDtiDsrResult {
  readonly maxLoanByLtv: number
  readonly maxLoanByDsr: number
  readonly maxLoan: number
  readonly ltvLimit: number
  readonly dsrLimit: number
}

const loanSchema = z.object({
  loanAmount: z.number().gt(0, '대출금은 0보다 커야 합니다.'),
  annualRate: z.number().min(0, '금리는 0 이상이어야 합니다.'),
  loanTermYears: z.number().gt(0, '대출기간은 0보다 커야 합니다.').max(50),
  repaymentMethod: z.enum(['equal-principal-interest', 'equal-principal', 'bullet']),
})

const buildEqualPrincipalInterest = (
  principal: number, monthlyRate: number, months: number
): readonly MonthlySchedule[] => {
  if (monthlyRate === 0) {
    const mp = roundToWon(principal / months)
    let remaining = principal
    return Array.from({ length: months }, (_, i) => {
      const pmt = i === months - 1 ? remaining : mp
      remaining = remaining - pmt
      return { month: i + 1, principal: pmt, interest: 0, payment: pmt, remainingBalance: remaining }
    })
  }

  const payment = roundToWon(
    principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  )
  let remaining = principal
  return Array.from({ length: months }, (_, i) => {
    const interest = roundToWon(remaining * monthlyRate)
    const princ = i === months - 1 ? remaining : payment - interest
    remaining = Math.max(0, remaining - princ)
    return { month: i + 1, principal: princ, interest, payment: princ + interest, remainingBalance: remaining }
  })
}

const buildEqualPrincipal = (
  principal: number, monthlyRate: number, months: number
): readonly MonthlySchedule[] => {
  const monthlyPrincipal = roundToWon(principal / months)
  let remaining = principal
  return Array.from({ length: months }, (_, i) => {
    const interest = roundToWon(remaining * monthlyRate)
    const princ = i === months - 1 ? remaining : monthlyPrincipal
    remaining = Math.max(0, remaining - princ)
    return { month: i + 1, principal: princ, interest, payment: princ + interest, remainingBalance: remaining }
  })
}

const buildBullet = (
  principal: number, monthlyRate: number, months: number
): readonly MonthlySchedule[] => {
  return Array.from({ length: months }, (_, i) => {
    const interest = roundToWon(principal * monthlyRate)
    const princ = i === months - 1 ? principal : 0
    const bal = i === months - 1 ? 0 : principal
    return { month: i + 1, principal: princ, interest, payment: princ + interest, remainingBalance: bal }
  })
}

export const calculateLoanRepayment = (input: LoanInput): LoanResult => {
  logger.logEntry('calculateLoanRepayment', { ...input })

  try {
    const validated = loanSchema.parse(input)
    const months = validated.loanTermYears * 12
    const monthlyRate = calculateMonthlyRate(validated.annualRate)

    let schedule: readonly MonthlySchedule[]
    switch (validated.repaymentMethod) {
      case 'equal-principal-interest':
        schedule = buildEqualPrincipalInterest(validated.loanAmount, monthlyRate, months)
        break
      case 'equal-principal':
        schedule = buildEqualPrincipal(validated.loanAmount, monthlyRate, months)
        break
      case 'bullet':
        schedule = buildBullet(validated.loanAmount, monthlyRate, months)
        break
    }

    const totalPayment = schedule.reduce((sum, s) => sum + s.payment, 0)
    const totalInterest = totalPayment - validated.loanAmount

    const result: LoanResult = {
      monthlyPayment: schedule[0].payment,
      totalPayment: roundToWon(totalPayment),
      totalInterest: roundToWon(totalInterest),
      schedule,
    }

    logger.logExit('calculateLoanRepayment', {
      monthlyPayment: result.monthlyPayment,
      totalInterest: result.totalInterest,
    })
    return result
  } catch (error) {
    logger.error('calculateLoanRepayment - error', error)
    throw error
  }
}

export const calculateMaxLoan = (
  input: LtvDtiDsrInput,
  loanTermYears: number,
  annualRate: number
): LtvDtiDsrResult => {
  logger.logEntry('calculateMaxLoan', { ...input, loanTermYears, annualRate })

  try {
    const ltvLimit = input.isFirstTimeBuyer
      ? LTV_LIMITS.firstTimeBuyer
      : LTV_LIMITS.none

    const dsrLimit = input.financialInstitution === 'first'
      ? DSR_LIMITS.firstTier
      : DSR_LIMITS.secondTier

    const maxLoanByLtv = roundToWon(input.propertyValue * ltvLimit)

    const stressAdd = input.region === 'capital'
      ? STRESS_DSR.capital
      : STRESS_DSR.nonCapital

    const effectiveRate = annualRate / 100 + stressAdd
    const monthlyRate = effectiveRate / 12
    const months = loanTermYears * 12

    const maxAnnualPayment = input.annualIncome * dsrLimit - input.otherDebtPayment
    const maxMonthlyPayment = maxAnnualPayment / 12

    let maxLoanByDsr: number
    if (monthlyRate === 0) {
      maxLoanByDsr = roundToWon(maxMonthlyPayment * months)
    } else {
      maxLoanByDsr = roundToWon(
        maxMonthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) /
        (monthlyRate * Math.pow(1 + monthlyRate, months))
      )
    }

    maxLoanByDsr = Math.max(0, maxLoanByDsr)
    const maxLoan = Math.min(maxLoanByLtv, maxLoanByDsr)

    const result: LtvDtiDsrResult = {
      maxLoanByLtv,
      maxLoanByDsr,
      maxLoan,
      ltvLimit: ltvLimit * 100,
      dsrLimit: dsrLimit * 100,
    }

    logger.logExit('calculateMaxLoan', result)
    return result
  } catch (error) {
    logger.error('calculateMaxLoan - error', error)
    throw error
  }
}
