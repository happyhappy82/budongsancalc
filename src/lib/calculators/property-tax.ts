import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'
import {
  FAIR_MARKET_VALUE_RATIO,
  CITY_PLANNING_TAX_RATE,
  PROPERTY_LOCAL_EDUCATION_TAX_RATE,
  getPropertyTaxFromBrackets,
} from '@/lib/constants/property-tax-rates'

const logger = createLogger('property-tax.ts')

export interface PropertyTaxInput {
  readonly assessedValue: number
  readonly isUrbanArea: boolean
}

export interface PropertyTaxResult {
  readonly taxBase: number
  readonly propertyTax: number
  readonly cityPlanningTax: number
  readonly localEducationTax: number
  readonly totalTax: number
  readonly effectiveRate: number
}

const inputSchema = z.object({
  assessedValue: z.number().gt(0, '공시가격은 0보다 커야 합니다.'),
  isUrbanArea: z.boolean(),
})

export const calculatePropertyTax = (
  input: PropertyTaxInput
): PropertyTaxResult => {
  logger.logEntry('calculatePropertyTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { assessedValue, isUrbanArea } = validated

    const taxBase = roundToWon(assessedValue * FAIR_MARKET_VALUE_RATIO)

    const propertyTax = roundToWon(getPropertyTaxFromBrackets(taxBase))

    const cityPlanningTax = isUrbanArea
      ? roundToWon(taxBase * CITY_PLANNING_TAX_RATE)
      : 0

    const localEducationTax = roundToWon(
      propertyTax * PROPERTY_LOCAL_EDUCATION_TAX_RATE
    )

    const totalTax = propertyTax + cityPlanningTax + localEducationTax
    const effectiveRate =
      assessedValue > 0 ? (totalTax / assessedValue) * 100 : 0

    const result: PropertyTaxResult = {
      taxBase,
      propertyTax,
      cityPlanningTax,
      localEducationTax,
      totalTax,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
    }

    logger.logExit('calculatePropertyTax', result)
    return result
  } catch (error) {
    logger.error('calculatePropertyTax - error', error)
    throw error
  }
}
