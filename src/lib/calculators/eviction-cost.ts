import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('eviction-cost.ts')

export type EvictionRegion = '서울' | '경기' | '기타'

export interface EvictionCostInput {
  readonly area: number
  readonly region: EvictionRegion
}

export interface EvictionCostResult {
  readonly applicationFee: number
  readonly deliveryFee: number
  readonly executorFee: number
  readonly executionCost: number
  readonly storageFee: number
  readonly totalCost: number
}

const inputSchema = z.object({
  area: z.number().gt(0, '부동산 면적은 0보다 커야 합니다.'),
  region: z.enum(['서울', '경기', '기타']),
})

const APPLICATION_FEE = 3_000
const DELIVERY_FEE = 44_800
const EXECUTOR_FEE = 40_000
const STORAGE_FEE = 200_000

const getExecutionCost = (area: number): number => {
  if (area <= 33) {
    return 500_000
  } else if (area <= 66) {
    return 800_000
  } else if (area <= 99) {
    return 1_200_000
  } else if (area <= 132) {
    return 1_500_000
  } else {
    return 2_000_000
  }
}

export const calculateEvictionCost = (
  input: EvictionCostInput
): EvictionCostResult => {
  logger.logEntry('calculateEvictionCost', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { area } = validated

    const applicationFee = APPLICATION_FEE
    const deliveryFee = DELIVERY_FEE
    const executorFee = EXECUTOR_FEE
    const executionCost = getExecutionCost(area)
    const storageFee = STORAGE_FEE

    const totalCost =
      applicationFee + deliveryFee + executorFee + executionCost + storageFee

    const result: EvictionCostResult = {
      applicationFee,
      deliveryFee,
      executorFee,
      executionCost,
      storageFee,
      totalCost,
    }

    logger.logExit('calculateEvictionCost', result)
    return result
  } catch (error) {
    logger.error('calculateEvictionCost - error', error)
    throw error
  }
}
