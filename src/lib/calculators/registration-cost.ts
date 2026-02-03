import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('registration-cost.ts')

export interface RegistrationCostInput {
  readonly propertyPrice: number
  readonly propertyType: '주택' | '오피스텔' | '기타건물' | '토지'
  readonly region: '서울' | '수도권' | '광역시' | '기타지역'
  readonly area: number
  readonly housingCount: '1주택' | '2주택' | '3주택이상'
  readonly isSelfRegistration: boolean
  readonly isFirstTimeBuyer: boolean
}

export interface RegistrationCostResult {
  readonly acquisitionTax: number
  readonly localEducationTax: number
  readonly ruralSpecialTax: number
  readonly housingBondPurchase: number
  readonly housingBondActualCost: number
  readonly attorneyFee: number
  readonly firstTimeBuyerDiscount: number
  readonly totalTaxes: number
  readonly totalCost: number
}

const schema = z.object({
  propertyPrice: z.number().gt(0, '매매가는 0보다 커야 합니다.'),
  propertyType: z.enum(['주택', '오피스텔', '기타건물', '토지']),
  region: z.enum(['서울', '수도권', '광역시', '기타지역']),
  area: z.number().gt(0, '전용면적은 0보다 커야 합니다.'),
  housingCount: z.enum(['1주택', '2주택', '3주택이상']),
  isSelfRegistration: z.boolean(),
  isFirstTimeBuyer: z.boolean(),
})

const getAcquisitionTaxRate = (
  propertyType: string,
  propertyPrice: number,
  housingCount: string
): number => {
  if (propertyType === '주택') {
    if (housingCount === '1주택') {
      if (propertyPrice <= 600_000_000) return 0.01
      if (propertyPrice <= 900_000_000) return 0.02
      return 0.03
    } else if (housingCount === '2주택') {
      return 0.08
    } else {
      return 0.12
    }
  } else if (propertyType === '오피스텔') {
    return 0.04
  } else if (propertyType === '기타건물') {
    return 0.04
  } else if (propertyType === '토지') {
    return 0.04
  }
  return 0.04
}

const getHousingBondRate = (
  region: string,
  propertyPrice: number
): number => {
  const price = propertyPrice / 10000

  if (region === '서울') {
    if (price <= 5000) return 0.013
    if (price <= 10000) return 0.017
    if (price <= 16000) return 0.021
    if (price <= 26000) return 0.025
    if (price <= 60000) return 0.031
    return 0.035
  } else {
    if (price <= 5000) return 0.01
    if (price <= 10000) return 0.014
    if (price <= 16000) return 0.018
    if (price <= 26000) return 0.022
    if (price <= 60000) return 0.028
    return 0.032
  }
}

export const calculateRegistrationCost = (
  input: RegistrationCostInput
): RegistrationCostResult => {
  logger.logEntry('calculateRegistrationCost', { ...input })

  try {
    const validated = schema.parse(input)

    const acquisitionTaxRate = getAcquisitionTaxRate(
      validated.propertyType,
      validated.propertyPrice,
      validated.housingCount
    )
    const acquisitionTax = roundToWon(
      validated.propertyPrice * acquisitionTaxRate
    )

    const educationTaxRate =
      validated.propertyType === '주택' ? 0.1 : 0.2
    const localEducationTax = roundToWon(acquisitionTax * educationTaxRate)

    const ruralSpecialTax =
      validated.propertyType === '주택' && validated.propertyPrice > 600_000_000
        ? roundToWon(validated.propertyPrice * 0.002)
        : 0

    const housingBondRate = getHousingBondRate(
      validated.region,
      validated.propertyPrice
    )
    const housingBondPurchase = roundToWon(
      validated.propertyPrice * housingBondRate
    )
    const housingBondActualCost = roundToWon(housingBondPurchase * 0.06)

    const attorneyFee = validated.isSelfRegistration ? 0 : 500_000

    let firstTimeBuyerDiscount = 0
    if (
      validated.isFirstTimeBuyer &&
      validated.propertyType === '주택' &&
      validated.housingCount === '1주택'
    ) {
      firstTimeBuyerDiscount = Math.min(acquisitionTax, 2_000_000)
    }

    const totalTaxes = roundToWon(
      acquisitionTax - firstTimeBuyerDiscount +
        localEducationTax +
        ruralSpecialTax
    )
    const totalCost = roundToWon(
      totalTaxes + housingBondActualCost + attorneyFee
    )

    const result: RegistrationCostResult = {
      acquisitionTax,
      localEducationTax,
      ruralSpecialTax,
      housingBondPurchase,
      housingBondActualCost,
      attorneyFee,
      firstTimeBuyerDiscount,
      totalTaxes,
      totalCost,
    }

    logger.logExit('calculateRegistrationCost', result)
    return result
  } catch (error) {
    logger.error('calculateRegistrationCost - error', error)
    throw error
  }
}
