import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundTo } from '@/lib/utils/math'

const logger = createLogger('building-ratio.ts')

export interface BuildingRatioInput {
  readonly landArea: number
  readonly buildingArea: number
  readonly totalFloorArea: number
  readonly floors: number
}

export interface BuildingRatioResult {
  readonly buildingCoverageRatio: number
  readonly floorAreaRatio: number
  readonly avgFloorArea: number
  readonly buildingAreaSqm: number
  readonly buildingAreaPyeong: number
  readonly totalFloorAreaSqm: number
  readonly totalFloorAreaPyeong: number
  readonly landAreaSqm: number
  readonly landAreaPyeong: number
}

const inputSchema = z.object({
  landArea: z.number().gt(0, '대지면적은 0보다 커야 합니다.'),
  buildingArea: z.number().gt(0, '건축면적은 0보다 커야 합니다.'),
  totalFloorArea: z.number().gt(0, '연면적은 0보다 커야 합니다.'),
  floors: z.number().int().gt(0, '층수는 0보다 커야 합니다.'),
})

const SQM_TO_PYEONG = 0.3025

export const calculateBuildingRatio = (
  input: BuildingRatioInput
): BuildingRatioResult => {
  logger.logEntry('calculateBuildingRatio', { ...input })

  try {
    const validated = inputSchema.parse(input)

    // 건폐율 = (건축면적 / 대지면적) * 100
    const buildingCoverageRatio = roundTo(
      (validated.buildingArea / validated.landArea) * 100,
      2
    )

    // 용적률 = (연면적 / 대지면적) * 100
    const floorAreaRatio = roundTo(
      (validated.totalFloorArea / validated.landArea) * 100,
      2
    )

    // 평균 층별면적 = 연면적 / 층수
    const avgFloorArea = roundTo(validated.totalFloorArea / validated.floors, 2)

    // 건축면적(평) = 건축면적 * 0.3025
    const buildingAreaPyeong = roundTo(validated.buildingArea * SQM_TO_PYEONG, 2)

    // 연면적(평) = 연면적 * 0.3025
    const totalFloorAreaPyeong = roundTo(validated.totalFloorArea * SQM_TO_PYEONG, 2)

    // 대지면적(평) = 대지면적 * 0.3025
    const landAreaPyeong = roundTo(validated.landArea * SQM_TO_PYEONG, 2)

    const result: BuildingRatioResult = {
      buildingCoverageRatio,
      floorAreaRatio,
      avgFloorArea,
      buildingAreaSqm: validated.buildingArea,
      buildingAreaPyeong,
      totalFloorAreaSqm: validated.totalFloorArea,
      totalFloorAreaPyeong,
      landAreaSqm: validated.landArea,
      landAreaPyeong,
    }

    logger.logExit('calculateBuildingRatio', result)
    return result
  } catch (error) {
    logger.error('calculateBuildingRatio - error', error)
    throw error
  }
}
