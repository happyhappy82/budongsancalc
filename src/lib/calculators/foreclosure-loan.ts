import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('foreclosure-loan.ts')

export interface ForeclosureLoanInput {
  readonly salePrice: number
  readonly appraisalPrice: number
  readonly borrowerType: '무주택자' | '1주택자' | '다주택자'
  readonly region: '수도권' | '비수도권'
  readonly financialTier: '1금융권' | '2금융권'
}

export interface ForeclosureLoanResult {
  readonly ltvRate: number
  readonly collateralBase: number
  readonly maxLoanAmount: number
  readonly requiredEquity: number
}

const schema = z.object({
  salePrice: z.number().gt(0, '낙찰가는 0보다 커야 합니다.'),
  appraisalPrice: z.number().gt(0, '감정가는 0보다 커야 합니다.'),
  borrowerType: z.enum(['무주택자', '1주택자', '다주택자']),
  region: z.enum(['수도권', '비수도권']),
  financialTier: z.enum(['1금융권', '2금융권']),
})

const LTV_RATES: Record<string, Record<string, Record<string, number>>> = {
  '1금융권': {
    무주택자: {
      수도권: 0.7,
      비수도권: 0.7,
    },
    '1주택자': {
      수도권: 0.6,
      비수도권: 0.6,
    },
    다주택자: {
      수도권: 0,
      비수도권: 0,
    },
  },
  '2금융권': {
    무주택자: {
      수도권: 0.8,
      비수도권: 0.85,
    },
    '1주택자': {
      수도권: 0.7,
      비수도권: 0.75,
    },
    다주택자: {
      수도권: 0.6,
      비수도권: 0.6,
    },
  },
}

export const calculateForeclosureLoan = (
  input: ForeclosureLoanInput
): ForeclosureLoanResult => {
  logger.logEntry('calculateForeclosureLoan', { ...input })

  try {
    const validated = schema.parse(input)

    const ltvRate =
      LTV_RATES[validated.financialTier][validated.borrowerType][
        validated.region
      ]
    const collateralBase = Math.min(
      validated.salePrice,
      validated.appraisalPrice
    )
    const maxLoanAmount = roundToWon(collateralBase * ltvRate)
    const requiredEquity = roundToWon(validated.salePrice - maxLoanAmount)

    const result: ForeclosureLoanResult = {
      ltvRate: ltvRate * 100,
      collateralBase,
      maxLoanAmount,
      requiredEquity,
    }

    logger.logExit('calculateForeclosureLoan', result)
    return result
  } catch (error) {
    logger.error('calculateForeclosureLoan - error', error)
    throw error
  }
}
