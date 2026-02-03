import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundTo } from '@/lib/utils/math'

const logger = createLogger('land-share.ts')

export interface LandShareInput {
  readonly totalLandArea: number
  readonly totalBuildingArea: number
  readonly unitArea: number
}

export interface LandShareResult {
  readonly landShareSqm: number
  readonly landSharePyeong: number
  readonly shareRatio: number
}

const schema = z.object({
  totalLandArea: z.number().gt(0, '대지면적은 0보다 커야 합니다.'),
  totalBuildingArea: z.number().gt(0, '전체연면적은 0보다 커야 합니다.'),
  unitArea: z.number().gt(0, '전용면적은 0보다 커야 합니다.'),
})

export const calculateLandShare = (input: LandShareInput): LandShareResult => {
  logger.logEntry('calculateLandShare', { ...input })

  try {
    const validated = schema.parse(input)

    if (validated.unitArea > validated.totalBuildingArea) {
      throw new Error('전용면적은 전체연면적보다 클 수 없습니다.')
    }

    const landShareSqm = validated.totalLandArea * (validated.unitArea / validated.totalBuildingArea)
    const landSharePyeong = landShareSqm / 3.305785
    const shareRatio = (validated.unitArea / validated.totalBuildingArea) * 100

    const result: LandShareResult = {
      landShareSqm: roundTo(landShareSqm, 2),
      landSharePyeong: roundTo(landSharePyeong, 2),
      shareRatio: roundTo(shareRatio, 2),
    }

    logger.logExit('calculateLandShare', result)
    return result
  } catch (error) {
    logger.error('calculateLandShare - error', error)
    throw error
  }
}
