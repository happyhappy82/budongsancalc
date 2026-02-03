import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundTo } from '@/lib/utils/math'

const logger = createLogger('date-calc.ts')

export interface DateCalcInput {
  readonly startDate: string
  readonly endDate: string
}

export interface DateCalcResult {
  readonly totalDays: number
  readonly totalMonths: number
  readonly totalYears: number
}

const schema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다.'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다.'),
})

export const calculateDateDiff = (input: DateCalcInput): DateCalcResult => {
  logger.logEntry('calculateDateDiff', { ...input })

  try {
    const validated = schema.parse(input)

    const start = new Date(validated.startDate)
    const end = new Date(validated.endDate)

    if (isNaN(start.getTime())) {
      throw new Error('시작일이 유효하지 않습니다.')
    }
    if (isNaN(end.getTime())) {
      throw new Error('종료일이 유효하지 않습니다.')
    }
    if (end < start) {
      throw new Error('종료일은 시작일보다 이후여야 합니다.')
    }

    const diffMs = end.getTime() - start.getTime()
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const totalMonths = roundTo(totalDays / 30.44, 1)
    const totalYears = roundTo(totalDays / 365.25, 2)

    const result: DateCalcResult = {
      totalDays,
      totalMonths,
      totalYears,
    }

    logger.logExit('calculateDateDiff', result)
    return result
  } catch (error) {
    logger.error('calculateDateDiff - error', error)
    throw error
  }
}
