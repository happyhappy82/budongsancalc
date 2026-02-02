import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon, roundTo } from '@/lib/utils/math'

const logger = createLogger('investment-return.ts')

export interface InvestmentReturnInput {
  readonly purchasePrice: number      // 매입가
  readonly currentPrice: number       // 현재 시세 (또는 예상 매도가)
  readonly totalInvestment: number    // 총 투자금 (자기자본)
  readonly annualRentalIncome: number // 연 임대수익
  readonly annualExpenses: number     // 연 비용 (관리비, 수선비, 세금 등)
  readonly holdingYears: number       // 보유기간
  readonly loanAmount: number         // 대출금
  readonly loanInterestRate: number   // 대출 금리 (%)
}

export interface InvestmentReturnResult {
  readonly totalGain: number           // 총 수익 (시세차익)
  readonly netRentalIncome: number     // 순 임대수익 (연)
  readonly totalRentalIncome: number   // 총 임대수익 (보유기간)
  readonly annualLoanInterest: number  // 연 대출이자
  readonly totalLoanInterest: number   // 총 대출이자
  readonly totalProfit: number         // 총 순수익 (시세차익 + 총임대수익 - 총대출이자)
  readonly roi: number                 // ROI (%) = 총순수익 / 자기자본 * 100
  readonly annualizedReturn: number    // 연환산 수익률 (%)
  readonly capRate: number             // 캡레이트 (%) = 순 임대수익 / 매입가 * 100
  readonly leverageEffect: number      // 레버리지 배율 = 매입가 / 자기자본
}

const inputSchema = z.object({
  purchasePrice: z.number().gt(0, '매입가는 0보다 커야 합니다.'),
  currentPrice: z.number().min(0, '현재 시세는 0 이상이어야 합니다.'),
  totalInvestment: z.number().gt(0, '총 투자금은 0보다 커야 합니다.'),
  annualRentalIncome: z.number().min(0, '연 임대수익은 0 이상이어야 합니다.'),
  annualExpenses: z.number().min(0, '연 비용은 0 이상이어야 합니다.'),
  holdingYears: z.number().min(1, '보유기간은 1년 이상이어야 합니다.').max(100),
  loanAmount: z.number().min(0, '대출금은 0 이상이어야 합니다.'),
  loanInterestRate: z.number().min(0).max(30),
})

export const calculateInvestmentReturn = (
  input: InvestmentReturnInput
): InvestmentReturnResult => {
  logger.logEntry('calculateInvestmentReturn', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const {
      purchasePrice,
      currentPrice,
      totalInvestment,
      annualRentalIncome,
      annualExpenses,
      holdingYears,
      loanAmount,
      loanInterestRate,
    } = validated

    const totalGain = roundToWon(currentPrice - purchasePrice)

    const netRentalIncome = roundToWon(annualRentalIncome - annualExpenses)

    const totalRentalIncome = roundToWon(netRentalIncome * holdingYears)

    const annualLoanInterest = roundToWon(
      loanAmount * (loanInterestRate / 100)
    )
    const totalLoanInterest = roundToWon(annualLoanInterest * holdingYears)

    const totalProfit = totalGain + totalRentalIncome - totalLoanInterest

    const roi =
      totalInvestment > 0
        ? roundTo((totalProfit / totalInvestment) * 100, 2)
        : 0

    // 연환산 수익률 (단리 기준)
    const annualizedReturn =
      holdingYears > 0 ? roundTo(roi / holdingYears, 2) : 0

    const capRate =
      purchasePrice > 0
        ? roundTo((netRentalIncome / purchasePrice) * 100, 2)
        : 0

    const leverageEffect =
      totalInvestment > 0
        ? roundTo(purchasePrice / totalInvestment, 2)
        : 0

    const result: InvestmentReturnResult = {
      totalGain,
      netRentalIncome,
      totalRentalIncome,
      annualLoanInterest,
      totalLoanInterest,
      totalProfit,
      roi,
      annualizedReturn,
      capRate,
      leverageEffect,
    }

    logger.logExit('calculateInvestmentReturn', result)
    return result
  } catch (error) {
    logger.error('calculateInvestmentReturn - error', error)
    throw error
  }
}
