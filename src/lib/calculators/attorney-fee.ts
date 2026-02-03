import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('attorney-fee.ts')

export interface AttorneyFeeInput {
  readonly propertyPrice: number
  readonly propertyType: '주택' | '그외건물'
  readonly includePublicCosts: boolean
}

export interface AttorneyFeeResult {
  readonly baseFee: number
  readonly revenueSeal: number
  readonly registrationSeal: number
  readonly miscellaneousCosts: number
  readonly publicCosts: number
  readonly totalFee: number
}

const schema = z.object({
  propertyPrice: z.number().gt(0, '부동산 가액은 0보다 커야 합니다.'),
  propertyType: z.enum(['주택', '그외건물']),
  includePublicCosts: z.boolean(),
})

const calculateBaseFee = (propertyPrice: number): number => {
  const price = propertyPrice

  if (price <= 10_000_000) {
    return 60_000
  } else if (price <= 50_000_000) {
    return 60_000 + (price - 10_000_000) * 0.0012
  } else if (price <= 100_000_000) {
    return 108_000 + (price - 50_000_000) * 0.0009
  } else if (price <= 300_000_000) {
    return 153_000 + (price - 100_000_000) * 0.0006
  } else if (price <= 500_000_000) {
    return 273_000 + (price - 300_000_000) * 0.0005
  } else if (price <= 1_000_000_000) {
    return 373_000 + (price - 500_000_000) * 0.0004
  } else {
    return 573_000 + (price - 1_000_000_000) * 0.0002
  }
}

const calculateRevenueSeal = (propertyPrice: number): number => {
  const price = propertyPrice

  if (price < 10_000_000) {
    return 0
  } else if (price < 30_000_000) {
    return 20_000
  } else if (price < 50_000_000) {
    return 40_000
  } else if (price < 100_000_000) {
    return 70_000
  } else if (price < 1_000_000_000) {
    return 150_000
  } else {
    return 350_000
  }
}

export const calculateAttorneyFee = (
  input: AttorneyFeeInput
): AttorneyFeeResult => {
  logger.logEntry('calculateAttorneyFee', { ...input })

  try {
    const validated = schema.parse(input)

    const baseFee = roundToWon(calculateBaseFee(validated.propertyPrice))
    const revenueSeal = calculateRevenueSeal(validated.propertyPrice)
    const registrationSeal = 15_000
    const miscellaneousCosts = 100_000

    const publicCosts = validated.includePublicCosts
      ? revenueSeal + registrationSeal
      : 0

    const totalFee = roundToWon(
      baseFee +
        (validated.includePublicCosts ? publicCosts : 0) +
        miscellaneousCosts
    )

    const result: AttorneyFeeResult = {
      baseFee,
      revenueSeal,
      registrationSeal,
      miscellaneousCosts,
      publicCosts,
      totalFee,
    }

    logger.logExit('calculateAttorneyFee', result)
    return result
  } catch (error) {
    logger.error('calculateAttorneyFee - error', error)
    throw error
  }
}
