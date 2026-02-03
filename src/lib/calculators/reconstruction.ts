import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('reconstruction.ts')

export type BuildingType = 'rc' | 'brick' | 'wood' | 'steel'

export interface ReconstructionInput {
  readonly approvalYear: number
  readonly buildingType: BuildingType
}

export interface ReconstructionResult {
  readonly standardYears: number
  readonly minimumYears: number
  readonly reconstructionYear: number
  readonly earlyReconstructionYear: number
  readonly elapsedYears: number
  readonly remainingYears: number
}

const schema = z.object({
  approvalYear: z
    .number()
    .int('연도는 정수여야 합니다.')
    .min(1900, '사용승인일은 1900년 이후여야 합니다.')
    .max(
      new Date().getFullYear(),
      '사용승인일은 현재 연도를 초과할 수 없습니다.'
    ),
  buildingType: z.enum(['rc', 'brick', 'wood', 'steel']),
})

const BUILDING_STANDARDS: Record<
  BuildingType,
  { standard: number; minimum: number }
> = {
  rc: { standard: 40, minimum: 30 },
  brick: { standard: 30, minimum: 20 },
  wood: { standard: 20, minimum: 15 },
  steel: { standard: 30, minimum: 20 },
}

export const calculateReconstruction = (
  input: ReconstructionInput
): ReconstructionResult => {
  logger.logEntry('calculateReconstruction', { ...input })

  try {
    const validated = schema.parse(input)
    const { approvalYear, buildingType } = validated

    const currentYear = new Date().getFullYear()
    const elapsedYears = currentYear - approvalYear

    const { standard, minimum } = BUILDING_STANDARDS[buildingType]

    const reconstructionYear = approvalYear + standard
    const earlyReconstructionYear = approvalYear + minimum
    const remainingYears = Math.max(0, standard - elapsedYears)

    const result: ReconstructionResult = {
      standardYears: standard,
      minimumYears: minimum,
      reconstructionYear,
      earlyReconstructionYear,
      elapsedYears,
      remainingYears,
    }

    logger.logExit('calculateReconstruction', result)
    return result
  } catch (error) {
    logger.error('calculateReconstruction - error', error)
    throw error
  }
}
