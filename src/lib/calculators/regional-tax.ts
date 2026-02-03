import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('regional-tax.ts')

export type BuildingType = '주택' | '그외'

export interface RegionalTaxInput {
  readonly buildingValue: number
  readonly buildingType: BuildingType
  readonly isSingleHousehold: boolean
  readonly isFireRisk: boolean
  readonly isLargeFireRisk: boolean
}

export interface RegionalTaxResult {
  readonly taxableBase: number
  readonly baseTax: number
  readonly additionalTax: number
  readonly totalTax: number
  readonly multiplier: number
}

const inputSchema = z.object({
  buildingValue: z.number().gt(0, '건물 시가표준액은 0보다 커야 합니다.'),
  buildingType: z.enum(['주택', '그외']),
  isSingleHousehold: z.boolean(),
  isFireRisk: z.boolean(),
  isLargeFireRisk: z.boolean(),
})

const calculateFireSafetyTax = (taxableBase: number): number => {
  if (taxableBase <= 6_000_000) {
    return roundToWon(taxableBase * 0.0004)
  } else if (taxableBase <= 13_000_000) {
    return roundToWon(2_400 + (taxableBase - 6_000_000) * 0.0005)
  } else if (taxableBase <= 26_000_000) {
    return roundToWon(5_900 + (taxableBase - 13_000_000) * 0.0006)
  } else if (taxableBase <= 39_000_000) {
    return roundToWon(13_700 + (taxableBase - 26_000_000) * 0.0008)
  } else if (taxableBase <= 64_000_000) {
    return roundToWon(24_100 + (taxableBase - 39_000_000) * 0.001)
  } else {
    return roundToWon(49_100 + (taxableBase - 64_000_000) * 0.0012)
  }
}

export const calculateRegionalTax = (
  input: RegionalTaxInput
): RegionalTaxResult => {
  logger.logEntry('calculateRegionalTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const {
      buildingValue,
      buildingType,
      isSingleHousehold,
      isFireRisk,
      isLargeFireRisk,
    } = validated

    // 과세표준 계산 (주택이고 1세대1주택인 경우 과세표준 없음)
    const taxableBase =
      buildingType === '주택' && isSingleHousehold ? 0 : buildingValue

    // 기본세액 계산 (소방분)
    const baseTax = calculateFireSafetyTax(taxableBase)

    // 가산세액 계산
    let multiplier = 1
    if (isLargeFireRisk) {
      multiplier = 3
    } else if (isFireRisk) {
      multiplier = 2
    }

    const additionalTax = multiplier > 1 ? baseTax * (multiplier - 1) : 0
    const totalTax = baseTax + additionalTax

    const result: RegionalTaxResult = {
      taxableBase,
      baseTax,
      additionalTax,
      totalTax,
      multiplier,
    }

    logger.logExit('calculateRegionalTax', result)
    return result
  } catch (error) {
    logger.error('calculateRegionalTax - error', error)
    throw error
  }
}
