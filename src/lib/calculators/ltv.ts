import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('ltv.ts')

export interface LtvInput {
  readonly propertyPrice: number
  readonly borrowerType: '생애최초' | '무주택자' | '1주택자' | '다주택자'
  readonly region: '투기지역' | '조정지역' | '수도권' | '비수도권'
}

export interface LtvResult {
  readonly ltvRate: number
  readonly maxLoanAmount: number
}

const schema = z.object({
  propertyPrice: z.number().gt(0, '주택가격은 0보다 커야 합니다.'),
  borrowerType: z.enum(['생애최초', '무주택자', '1주택자', '다주택자']),
  region: z.enum(['투기지역', '조정지역', '수도권', '비수도권']),
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

export const calculateLtv = (input: LtvInput): LtvResult => {
  logger.logEntry('calculateLtv', { ...input })

  try {
    const validated = schema.parse(input)

    const ltvRate = LTV_RATES[validated.borrowerType][validated.region]
    const maxLoanAmount = roundToWon(validated.propertyPrice * ltvRate)

    const result: LtvResult = {
      ltvRate: ltvRate * 100,
      maxLoanAmount,
    }

    logger.logExit('calculateLtv', result)
    return result
  } catch (error) {
    logger.error('calculateLtv - error', error)
    throw error
  }
}
