import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('holding-tax.ts')

export interface HoldingTaxInput {
  readonly publicPrice: number
  readonly isSingleHousehold: boolean
  readonly housingCount: 1 | 2 | 3
}

export interface HoldingTaxResult {
  readonly propertyTax: number
  readonly urbanTax: number
  readonly educationTax: number
  readonly comprehensiveTax: number
  readonly ruralTax: number
  readonly totalHoldingTax: number
  readonly taxBase: number
  readonly comprehensiveTaxBase: number
}

const schema = z.object({
  publicPrice: z.number().gt(0, '공시가격은 0보다 커야 합니다.'),
  isSingleHousehold: z.boolean(),
  housingCount: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

const FAIR_MARKET_RATIO = 0.6

const calculatePropertyTax = (
  taxBase: number,
  isSingleHousehold: boolean
): number => {
  if (isSingleHousehold) {
    // 1세대1주택 특례
    if (taxBase <= 60_000_000) {
      return taxBase * 0.0005
    } else if (taxBase <= 150_000_000) {
      return 30_000 + (taxBase - 60_000_000) * 0.001
    } else if (taxBase <= 300_000_000) {
      return 120_000 + (taxBase - 150_000_000) * 0.002
    } else {
      return 420_000 + (taxBase - 300_000_000) * 0.0035
    }
  } else {
    // 일반 세율
    if (taxBase <= 60_000_000) {
      return taxBase * 0.001
    } else if (taxBase <= 150_000_000) {
      return 60_000 + (taxBase - 60_000_000) * 0.0015
    } else if (taxBase <= 300_000_000) {
      return 195_000 + (taxBase - 150_000_000) * 0.0025
    } else {
      return 570_000 + (taxBase - 300_000_000) * 0.004
    }
  }
}

const calculateComprehensiveTax = (
  comprehensiveTaxBase: number,
  housingCount: 1 | 2 | 3
): number => {
  if (comprehensiveTaxBase <= 0) {
    return 0
  }

  if (housingCount <= 2) {
    // 2주택 이하
    if (comprehensiveTaxBase <= 300_000_000) {
      return comprehensiveTaxBase * 0.005
    } else if (comprehensiveTaxBase <= 600_000_000) {
      return comprehensiveTaxBase * 0.007 - 600_000
    } else if (comprehensiveTaxBase <= 1_200_000_000) {
      return comprehensiveTaxBase * 0.01 - 2_400_000
    } else if (comprehensiveTaxBase <= 2_500_000_000) {
      return comprehensiveTaxBase * 0.013 - 6_000_000
    } else if (comprehensiveTaxBase <= 5_000_000_000) {
      return comprehensiveTaxBase * 0.015 - 11_000_000
    } else if (comprehensiveTaxBase <= 9_400_000_000) {
      return comprehensiveTaxBase * 0.02 - 36_000_000
    } else {
      return comprehensiveTaxBase * 0.027 - 101_800_000
    }
  } else {
    // 3주택 이상
    if (comprehensiveTaxBase <= 300_000_000) {
      return comprehensiveTaxBase * 0.005
    } else if (comprehensiveTaxBase <= 600_000_000) {
      return comprehensiveTaxBase * 0.007 - 600_000
    } else if (comprehensiveTaxBase <= 1_200_000_000) {
      return comprehensiveTaxBase * 0.01 - 2_400_000
    } else if (comprehensiveTaxBase <= 2_500_000_000) {
      return comprehensiveTaxBase * 0.02 - 14_400_000
    } else if (comprehensiveTaxBase <= 5_000_000_000) {
      return comprehensiveTaxBase * 0.03 - 39_400_000
    } else if (comprehensiveTaxBase <= 9_400_000_000) {
      return comprehensiveTaxBase * 0.04 - 89_400_000
    } else {
      return comprehensiveTaxBase * 0.05 - 183_400_000
    }
  }
}

export const calculateHoldingTax = (input: HoldingTaxInput): HoldingTaxResult => {
  logger.logEntry('calculateHoldingTax', { ...input })

  try {
    const validated = schema.parse(input)

    // Convert 만원 to 원
    const publicPriceWon = validated.publicPrice * 10_000

    // 재산세 과세표준
    const taxBase = roundToWon(publicPriceWon * FAIR_MARKET_RATIO)

    // 재산세 계산
    const propertyTax = roundToWon(
      calculatePropertyTax(taxBase, validated.isSingleHousehold)
    )

    // 도시지역분 (재산세 * 0.14)
    const urbanTax = roundToWon(propertyTax * 0.14)

    // 지방교육세 (재산세 * 0.2)
    const educationTax = roundToWon(propertyTax * 0.2)

    // 종부세 공제액
    const deduction =
      validated.isSingleHousehold && validated.housingCount === 1
        ? 1_200_000_000
        : 900_000_000

    // 종부세 과세표준
    const comprehensiveTaxBase = roundToWon(
      Math.max(0, (publicPriceWon - deduction) * FAIR_MARKET_RATIO)
    )

    // 종부세 계산
    const comprehensiveTax = roundToWon(
      calculateComprehensiveTax(comprehensiveTaxBase, validated.housingCount)
    )

    // 농어촌특별세 (종부세 * 0.2)
    const ruralTax = roundToWon(comprehensiveTax * 0.2)

    // 총 보유세
    const totalHoldingTax =
      propertyTax + urbanTax + educationTax + comprehensiveTax + ruralTax

    const result: HoldingTaxResult = {
      propertyTax,
      urbanTax,
      educationTax,
      comprehensiveTax,
      ruralTax,
      totalHoldingTax,
      taxBase,
      comprehensiveTaxBase,
    }

    logger.logExit('calculateHoldingTax', result)
    return result
  } catch (error) {
    logger.error('calculateHoldingTax - error', error)
    throw error
  }
}
