import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('inheritance-share.ts')

export interface InheritanceShareInput {
  readonly totalAssets: number
  readonly hasSpouse: boolean
  readonly numberOfChildren: number
}

export interface HeirShare {
  readonly heir: string
  readonly shareRatio: number
  readonly amount: number
}

export interface InheritanceShareResult {
  readonly shares: readonly HeirShare[]
}

const schema = z.object({
  totalAssets: z.number().gt(0, '상속재산가액은 0보다 커야 합니다.'),
  hasSpouse: z.boolean(),
  numberOfChildren: z.number().min(0, '자녀수는 0 이상이어야 합니다.'),
})

export const calculateInheritanceShare = (input: InheritanceShareInput): InheritanceShareResult => {
  logger.logEntry('calculateInheritanceShare', { ...input })

  try {
    const validated = schema.parse(input)

    const shares: HeirShare[] = []

    if (!validated.hasSpouse && validated.numberOfChildren === 0) {
      throw new Error('상속인이 없습니다.')
    }

    if (validated.hasSpouse && validated.numberOfChildren === 0) {
      shares.push({
        heir: '배우자',
        shareRatio: 100,
        amount: roundToWon(validated.totalAssets),
      })
    } else if (!validated.hasSpouse && validated.numberOfChildren > 0) {
      const perChild = validated.totalAssets / validated.numberOfChildren
      const ratio = roundTo(100 / validated.numberOfChildren, 2)
      for (let i = 1; i <= validated.numberOfChildren; i++) {
        shares.push({
          heir: `자녀 ${i}`,
          shareRatio: ratio,
          amount: roundToWon(perChild),
        })
      }
    } else {
      const totalShares = 1.5 + validated.numberOfChildren
      const spouseShare = validated.totalAssets * (1.5 / totalShares)
      const childShare = validated.totalAssets * (1 / totalShares)

      shares.push({
        heir: '배우자',
        shareRatio: roundTo((1.5 / totalShares) * 100, 2),
        amount: roundToWon(spouseShare),
      })

      for (let i = 1; i <= validated.numberOfChildren; i++) {
        shares.push({
          heir: `자녀 ${i}`,
          shareRatio: roundTo((1 / totalShares) * 100, 2),
          amount: roundToWon(childShare),
        })
      }
    }

    const result: InheritanceShareResult = {
      shares,
    }

    logger.logExit('calculateInheritanceShare', result)
    return result
  } catch (error) {
    logger.error('calculateInheritanceShare - error', error)
    throw error
  }
}
