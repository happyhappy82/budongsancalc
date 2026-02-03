import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('auction-distribution.ts')

export interface AuctionDistributionInput {
  readonly salePrice: number
  readonly auctionCost: number
  readonly seniorClaim: number
  readonly tenantDeposit: number
  readonly juniorClaim: number
}

export interface DistributionItem {
  readonly name: string
  readonly claim: number
  readonly distributed: number
  readonly satisfied: boolean
  readonly shortfall: number
}

export interface AuctionDistributionResult {
  readonly totalSalePrice: number
  readonly totalDistributed: number
  readonly distributions: readonly DistributionItem[]
}

const schema = z.object({
  salePrice: z.number().min(0, '매각대금은 0 이상이어야 합니다.'),
  auctionCost: z.number().min(0, '경매비용은 0 이상이어야 합니다.'),
  seniorClaim: z.number().min(0, '선순위채권액은 0 이상이어야 합니다.'),
  tenantDeposit: z.number().min(0, '임차보증금은 0 이상이어야 합니다.'),
  juniorClaim: z.number().min(0, '후순위채권액은 0 이상이어야 합니다.'),
})

export const calculateAuctionDistribution = (
  input: AuctionDistributionInput
): AuctionDistributionResult => {
  logger.logEntry('calculateAuctionDistribution', { ...input })

  try {
    const validated = schema.parse(input)
    const { salePrice, auctionCost, seniorClaim, tenantDeposit, juniorClaim } =
      validated

    let remaining = salePrice
    const distributions: DistributionItem[] = []

    const auctionDist = Math.min(remaining, auctionCost)
    distributions.push({
      name: '경매비용',
      claim: auctionCost,
      distributed: roundToWon(auctionDist),
      satisfied: auctionDist >= auctionCost,
      shortfall: roundToWon(Math.max(0, auctionCost - auctionDist)),
    })
    remaining -= auctionDist

    const seniorDist = Math.min(remaining, seniorClaim)
    distributions.push({
      name: '선순위채권',
      claim: seniorClaim,
      distributed: roundToWon(seniorDist),
      satisfied: seniorDist >= seniorClaim,
      shortfall: roundToWon(Math.max(0, seniorClaim - seniorDist)),
    })
    remaining -= seniorDist

    const tenantDist = Math.min(remaining, tenantDeposit)
    distributions.push({
      name: '임차보증금',
      claim: tenantDeposit,
      distributed: roundToWon(tenantDist),
      satisfied: tenantDist >= tenantDeposit,
      shortfall: roundToWon(Math.max(0, tenantDeposit - tenantDist)),
    })
    remaining -= tenantDist

    const juniorDist = Math.min(remaining, juniorClaim)
    distributions.push({
      name: '후순위채권',
      claim: juniorClaim,
      distributed: roundToWon(juniorDist),
      satisfied: juniorDist >= juniorClaim,
      shortfall: roundToWon(Math.max(0, juniorClaim - juniorDist)),
    })
    remaining -= juniorDist

    distributions.push({
      name: '소유자 잔여금',
      claim: 0,
      distributed: roundToWon(remaining),
      satisfied: true,
      shortfall: 0,
    })

    const totalDistributed =
      auctionDist + seniorDist + tenantDist + juniorDist + remaining

    const result: AuctionDistributionResult = {
      totalSalePrice: salePrice,
      totalDistributed: roundToWon(totalDistributed),
      distributions,
    }

    logger.logExit('calculateAuctionDistribution', result)
    return result
  } catch (error) {
    logger.error('calculateAuctionDistribution - error', error)
    throw error
  }
}
