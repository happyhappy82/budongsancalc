import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('auction-cost.ts')

export interface AuctionCostInput {
  readonly bidPrice: number
}

export interface AuctionCostResult {
  readonly acquisitionTax: number
  readonly evictionCost: number
  readonly movingCost: number
  readonly repairCost: number
  readonly lawyerFee: number
  readonly totalIncidentalCost: number
  readonly totalInvestment: number
}

const inputSchema = z.object({
  bidPrice: z.number().gt(0, '매각대금은 0보다 커야 합니다.'),
})

const ACQUISITION_TAX_RATE = 0.046
const EVICTION_COST_DEFAULT = 2_000_000
const MOVING_COST_DEFAULT = 500_000
const REPAIR_COST_RATE = 0.03
const LAWYER_FEE = 500_000

export const calculateAuctionCost = (
  input: AuctionCostInput
): AuctionCostResult => {
  logger.logEntry('calculateAuctionCost', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { bidPrice } = validated

    const acquisitionTax = roundToWon(bidPrice * ACQUISITION_TAX_RATE)
    const evictionCost = EVICTION_COST_DEFAULT
    const movingCost = MOVING_COST_DEFAULT
    const repairCost = roundToWon(bidPrice * REPAIR_COST_RATE)
    const lawyerFee = LAWYER_FEE

    const totalIncidentalCost =
      acquisitionTax + evictionCost + movingCost + repairCost + lawyerFee
    const totalInvestment = bidPrice + totalIncidentalCost

    const result: AuctionCostResult = {
      acquisitionTax,
      evictionCost,
      movingCost,
      repairCost,
      lawyerFee,
      totalIncidentalCost,
      totalInvestment,
    }

    logger.logExit('calculateAuctionCost', result)
    return result
  } catch (error) {
    logger.error('calculateAuctionCost - error', error)
    throw error
  }
}
