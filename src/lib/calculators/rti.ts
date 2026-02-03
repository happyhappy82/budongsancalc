import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundTo } from '@/lib/utils/math'

const logger = createLogger('rti.ts')

export interface RtiInput {
  readonly annualRentalIncome: number
  readonly loanAmount: number
  readonly interestRate: number
  readonly propertyType: '주거용' | '비주거용'
}

export interface RtiResult {
  readonly rtiRatio: number
  readonly annualRentalIncome: number
  readonly annualInterestCost: number
  readonly isQualified: boolean
  readonly requiredRti: number
  readonly maxLoanAmount: number
}

const schema = z.object({
  annualRentalIncome: z.number().gt(0, '연간임대소득은 0보다 커야 합니다.'),
  loanAmount: z.number().gt(0, '대출금액은 0보다 커야 합니다.'),
  interestRate: z.number().gt(0, '대출이자율은 0보다 커야 합니다.'),
  propertyType: z.enum(['주거용', '비주거용']),
})

const RTI_REQUIREMENTS: Record<string, number> = {
  주거용: 1.25,
  비주거용: 1.5,
}

export const calculateRti = (input: RtiInput): RtiResult => {
  logger.logEntry('calculateRti', { ...input })

  try {
    const validated = schema.parse(input)

    const annualInterestCost = validated.loanAmount * validated.interestRate / 100
    const rtiRatio = roundTo(validated.annualRentalIncome / annualInterestCost, 2)
    const requiredRti = RTI_REQUIREMENTS[validated.propertyType]
    const isQualified = rtiRatio >= requiredRti

    const maxLoanAmount = Math.floor(
      (validated.annualRentalIncome / requiredRti) / (validated.interestRate / 100)
    )

    const result: RtiResult = {
      rtiRatio,
      annualRentalIncome: validated.annualRentalIncome,
      annualInterestCost,
      isQualified,
      requiredRti,
      maxLoanAmount,
    }

    logger.logExit('calculateRti', result)
    return result
  } catch (error) {
    logger.error('calculateRti - error', error)
    throw error
  }
}
