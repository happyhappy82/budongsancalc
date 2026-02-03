import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'

const logger = createLogger('stamp-tax.ts')

export interface StampTaxInput {
  readonly transactionAmount: number
}

export interface StampTaxResult {
  readonly stampTax: number
}

const inputSchema = z.object({
  transactionAmount: z.number().gte(0, '거래금액은 0 이상이어야 합니다.'),
})

export const calculateStampTax = (input: StampTaxInput): StampTaxResult => {
  logger.logEntry('calculateStampTax', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { transactionAmount } = validated

    let stampTax = 0

    if (transactionAmount <= 10_000_000) {
      stampTax = 0
    } else if (transactionAmount <= 30_000_000) {
      stampTax = 20_000
    } else if (transactionAmount <= 50_000_000) {
      stampTax = 40_000
    } else if (transactionAmount <= 100_000_000) {
      stampTax = 70_000
    } else if (transactionAmount <= 1_000_000_000) {
      stampTax = 150_000
    } else {
      stampTax = 350_000
    }

    const result: StampTaxResult = {
      stampTax,
    }

    logger.logExit('calculateStampTax', result)
    return result
  } catch (error) {
    logger.error('calculateStampTax - error', error)
    throw error
  }
}
