import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('rental-yield.ts')

export interface RentalYieldInput {
  readonly purchasePrice: number
  readonly otherCosts: number
  readonly loanAmount: number
  readonly loanRate: number
  readonly deposit: number
  readonly monthlyRent: number
  readonly annualExpenses: number
}

export interface RentalYieldResult {
  readonly totalInvestment: number
  readonly equity: number
  readonly annualRentalIncome: number
  readonly annualLoanInterest: number
  readonly netIncome: number
  readonly grossYield: number
  readonly roi: number
  readonly capRate: number
}

const inputSchema = z.object({
  purchasePrice: z.number().min(0, '매매가는 0 이상이어야 합니다.'),
  otherCosts: z.number().min(0, '기타비용은 0 이상이어야 합니다.'),
  loanAmount: z.number().min(0, '대출금은 0 이상이어야 합니다.'),
  loanRate: z.number().min(0, '대출이율은 0 이상이어야 합니다.').max(100, '대출이율은 100% 이하여야 합니다.'),
  deposit: z.number().min(0, '보증금은 0 이상이어야 합니다.'),
  monthlyRent: z.number().min(0, '월세는 0 이상이어야 합니다.'),
  annualExpenses: z.number().min(0, '연간운영비용은 0 이상이어야 합니다.'),
})

export const calculateRentalYield = (
  input: RentalYieldInput
): RentalYieldResult => {
  logger.logEntry('calculateRentalYield', { ...input })

  try {
    const validated = inputSchema.parse(input)

    // 총투자금 = 매매가 + 기타비용
    const totalInvestment = roundToWon(validated.purchasePrice + validated.otherCosts)

    // 자기자본 = 총투자금 - 대출금 - 보증금
    const equity = roundToWon(totalInvestment - validated.loanAmount - validated.deposit)

    // 연간임대수입 = 월세 * 12
    const annualRentalIncome = roundToWon(validated.monthlyRent * 12)

    // 연간대출이자 = 대출금 * 대출이율 / 100
    const annualLoanInterest = roundToWon(validated.loanAmount * validated.loanRate / 100)

    // 순수익 = 연간임대수입 - 연간대출이자 - 연간운영비용
    const netIncome = roundToWon(annualRentalIncome - annualLoanInterest - validated.annualExpenses)

    // 총수익률 = (연간임대수입 / 총투자금) * 100
    const grossYield = totalInvestment > 0
      ? roundTo((annualRentalIncome / totalInvestment) * 100, 2)
      : 0

    // 순수익률(ROI) = (순수익 / 자기자본) * 100
    const roi = equity > 0
      ? roundTo((netIncome / equity) * 100, 2)
      : 0

    // 캡레이트 = ((연간임대수입 - 연간운영비용) / 총투자금) * 100
    const capRate = totalInvestment > 0
      ? roundTo(((annualRentalIncome - validated.annualExpenses) / totalInvestment) * 100, 2)
      : 0

    const result: RentalYieldResult = {
      totalInvestment,
      equity,
      annualRentalIncome,
      annualLoanInterest,
      netIncome,
      grossYield,
      roi,
      capRate,
    }

    logger.logExit('calculateRentalYield', result)
    return result
  } catch (error) {
    logger.error('calculateRentalYield - error', error)
    throw error
  }
}
