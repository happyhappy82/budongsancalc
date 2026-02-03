import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('max-loan.ts')

export interface MaxLoanInput {
  readonly propertyPrice: number
  readonly annualIncome: number
  readonly borrowerType: '생애최초' | '무주택자' | '1주택자' | '다주택자'
  readonly region: '투기지역' | '조정지역' | '수도권' | '비수도권'
  readonly interestRate: number
  readonly loanTermYears: number
}

export interface MaxLoanResult {
  readonly ltvLimit: number
  readonly ltvRate: number
  readonly dsrLimit: number
  readonly dsrRate: number
  readonly maxLoanAmount: number
}

const schema = z.object({
  propertyPrice: z.number().gt(0, '주택가격은 0보다 커야 합니다.'),
  annualIncome: z.number().gt(0, '연소득은 0보다 커야 합니다.'),
  borrowerType: z.enum(['생애최초', '무주택자', '1주택자', '다주택자']),
  region: z.enum(['투기지역', '조정지역', '수도권', '비수도권']),
  interestRate: z.number().gt(0, '대출금리는 0보다 커야 합니다.'),
  loanTermYears: z.number().gt(0, '대출기간은 0보다 커야 합니다.'),
})

const LTV_RATES: Record<string, Record<string, number>> = {
  생애최초: {
    투기지역: 0.7,
    조정지역: 0.7,
    수도권: 0.7,
    비수도권: 0.8,
  },
  무주택자: {
    투기지역: 0.4,
    조정지역: 0.5,
    수도권: 0.7,
    비수도권: 0.7,
  },
  '1주택자': {
    투기지역: 0.4,
    조정지역: 0.5,
    수도권: 0.6,
    비수도권: 0.6,
  },
  다주택자: {
    투기지역: 0,
    조정지역: 0,
    수도권: 0,
    비수도권: 0.6,
  },
}

const DSR_RATE = 0.4

export const calculateMaxLoan = (input: MaxLoanInput): MaxLoanResult => {
  logger.logEntry('calculateMaxLoan', { ...input })

  try {
    const validated = schema.parse(input)

    const ltvRate = LTV_RATES[validated.borrowerType][validated.region]
    const ltvLimit = roundToWon(validated.propertyPrice * ltvRate)

    const maxAnnualPayment = validated.annualIncome * DSR_RATE
    const annualInterestRate = validated.interestRate / 100
    const totalPeriods = validated.loanTermYears

    const dsrLimit = roundToWon(
      maxAnnualPayment / (annualInterestRate + 1 / totalPeriods)
    )

    const maxLoanAmount = Math.min(ltvLimit, dsrLimit)

    const result: MaxLoanResult = {
      ltvLimit,
      ltvRate: ltvRate * 100,
      dsrLimit,
      dsrRate: DSR_RATE * 100,
      maxLoanAmount,
    }

    logger.logExit('calculateMaxLoan', result)
    return result
  } catch (error) {
    logger.error('calculateMaxLoan - error', error)
    throw error
  }
}
