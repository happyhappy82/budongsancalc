import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'
import {
  getSingleHomeTaxRate,
  LOCAL_EDUCATION_TAX_RATE,
  RURAL_SPECIAL_TAX_RATE,
  FIRST_TIME_BUYER_DISCOUNT,
} from '@/lib/constants/acquisition-tax-rates'

const logger = createLogger('acquisition-tax.ts')

export interface AcquisitionTaxInput {
  readonly purchasePrice: number
  readonly housingCount: 1 | 2 | 3
  readonly isRegulated: boolean
  readonly isFirstTimeBuyer: boolean
}

export interface AcquisitionTaxResult {
  readonly acquisitionTax: number
  readonly localEducationTax: number
  readonly ruralSpecialTax: number
  readonly totalTax: number
  readonly effectiveRate: number
  readonly firstTimeBuyerDiscount: number
  readonly taxRate: number
}

const inputSchema = z.object({
  purchasePrice: z.number().gt(0, '매매가는 0보다 커야 합니다.'),
  housingCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  isRegulated: z.boolean(),
  isFirstTimeBuyer: z.boolean(),
})

export const getAcquisitionTaxRate = (
  price: number,
  housingCount: 1 | 2 | 3,
  isRegulated: boolean
): number => {
  logger.logEntry('getAcquisitionTaxRate', { price, housingCount, isRegulated })

  let rate: number
  if (housingCount === 1) {
    rate = getSingleHomeTaxRate(price)
  } else if (housingCount === 2) {
    rate = isRegulated ? 0.08 : getSingleHomeTaxRate(price)
  } else {
    rate = isRegulated ? 0.12 : 0.08
  }

  logger.logExit('getAcquisitionTaxRate', rate)
  return rate
}

export const calculateAcquisitionTax = (
  input: AcquisitionTaxInput
): AcquisitionTaxResult => {
  logger.logEntry('calculateAcquisitionTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { purchasePrice, housingCount, isRegulated, isFirstTimeBuyer } =
      validated

    const taxRate = getAcquisitionTaxRate(
      purchasePrice,
      housingCount,
      isRegulated
    )

    let acquisitionTax = roundToWon(purchasePrice * taxRate)

    const discount =
      isFirstTimeBuyer && housingCount === 1
        ? Math.min(FIRST_TIME_BUYER_DISCOUNT, acquisitionTax)
        : 0

    acquisitionTax = acquisitionTax - discount

    const localEducationTax = roundToWon(
      acquisitionTax * LOCAL_EDUCATION_TAX_RATE
    )

    const ruralSpecialTax =
      purchasePrice > 600_000_000
        ? roundToWon(purchasePrice * RURAL_SPECIAL_TAX_RATE)
        : 0

    const totalTax = acquisitionTax + localEducationTax + ruralSpecialTax
    const effectiveRate =
      purchasePrice > 0 ? (totalTax / purchasePrice) * 100 : 0

    const result: AcquisitionTaxResult = {
      acquisitionTax,
      localEducationTax,
      ruralSpecialTax,
      totalTax,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      firstTimeBuyerDiscount: discount,
      taxRate: Math.round(taxRate * 10000) / 100,
    }

    logger.logExit('calculateAcquisitionTax', result)
    return result
  } catch (error) {
    logger.error('calculateAcquisitionTax - error', error)
    throw error
  }
}
