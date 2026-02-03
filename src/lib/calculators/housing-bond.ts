import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('housing-bond.ts')

export type Region = '서울' | '광역시' | '시지역' | '기타'
export type AreaSize = '60㎡이하' | '60~85㎡' | '85㎡초과'

export interface HousingBondInput {
  readonly salePrice: number
  readonly region: Region
  readonly areaSize: AreaSize
}

export interface HousingBondResult {
  readonly bondPurchaseAmount: number
  readonly discountCost: number
  readonly actualBurden: number
  readonly purchaseRate: number
}

const inputSchema = z.object({
  salePrice: z.number().gt(0, '매매가격은 0보다 커야 합니다.'),
  region: z.enum(['서울', '광역시', '시지역', '기타']),
  areaSize: z.enum(['60㎡이하', '60~85㎡', '85㎡초과']),
})

const BOND_RATES: Record<Region, Record<AreaSize, number>> = {
  서울: {
    '60㎡이하': 13 / 1000,
    '60~85㎡': 21 / 1000,
    '85㎡초과': 31 / 1000,
  },
  광역시: {
    '60㎡이하': 8 / 1000,
    '60~85㎡': 16 / 1000,
    '85㎡초과': 24 / 1000,
  },
  시지역: {
    '60㎡이하': 6 / 1000,
    '60~85㎡': 13 / 1000,
    '85㎡초과': 21 / 1000,
  },
  기타: {
    '60㎡이하': 5 / 1000,
    '60~85㎡': 10 / 1000,
    '85㎡초과': 16 / 1000,
  },
}

const DISCOUNT_RATE = 0.06

export const calculateHousingBond = (
  input: HousingBondInput
): HousingBondResult => {
  logger.logEntry('calculateHousingBond', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { salePrice, region, areaSize } = validated

    const purchaseRate = BOND_RATES[region][areaSize]
    const bondPurchaseAmount = roundToWon(salePrice * purchaseRate)
    const discountCost = roundToWon(bondPurchaseAmount * DISCOUNT_RATE)
    const actualBurden = bondPurchaseAmount - discountCost

    const result: HousingBondResult = {
      bondPurchaseAmount,
      discountCost,
      actualBurden,
      purchaseRate: Math.round(purchaseRate * 10000) / 10,
    }

    logger.logExit('calculateHousingBond', result)
    return result
  } catch (error) {
    logger.error('calculateHousingBond - error', error)
    throw error
  }
}
