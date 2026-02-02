import { describe, it, expect } from 'vitest'
import { calculateInvestmentReturn } from '../investment-return'

describe('calculateInvestmentReturn', () => {
  it('기본 투자수익률 계산 → 시세차익 + 임대수익 - 이자', () => {
    const result = calculateInvestmentReturn({
      purchasePrice: 500_000_000,
      currentPrice: 600_000_000,
      totalInvestment: 200_000_000,
      annualRentalIncome: 24_000_000,
      annualExpenses: 4_000_000,
      holdingYears: 5,
      loanAmount: 300_000_000,
      loanInterestRate: 4,
    })
    // totalGain = 600M - 500M = 100M
    expect(result.totalGain).toBe(100_000_000)
    // netRentalIncome = 24M - 4M = 20M
    expect(result.netRentalIncome).toBe(20_000_000)
    // totalRentalIncome = 20M * 5 = 100M
    expect(result.totalRentalIncome).toBe(100_000_000)
    // annualLoanInterest = 300M * 0.04 = 12M
    expect(result.annualLoanInterest).toBe(12_000_000)
    // totalLoanInterest = 12M * 5 = 60M
    expect(result.totalLoanInterest).toBe(60_000_000)
    // totalProfit = 100M + 100M - 60M = 140M
    expect(result.totalProfit).toBe(140_000_000)
    // roi = 140M / 200M * 100 = 70%
    expect(result.roi).toBe(70)
    // annualizedReturn = 70 / 5 = 14%
    expect(result.annualizedReturn).toBe(14)
  })

  it('캡레이트 계산 → 순임대수익 / 매입가', () => {
    const result = calculateInvestmentReturn({
      purchasePrice: 1_000_000_000,
      currentPrice: 1_000_000_000,
      totalInvestment: 500_000_000,
      annualRentalIncome: 60_000_000,
      annualExpenses: 10_000_000,
      holdingYears: 1,
      loanAmount: 500_000_000,
      loanInterestRate: 4,
    })
    // capRate = (60M - 10M) / 1B * 100 = 5%
    expect(result.capRate).toBe(5)
    // leverage = 1B / 500M = 2
    expect(result.leverageEffect).toBe(2)
  })

  it('대출 없이 순수 자기자본 투자 → 이자 0', () => {
    const result = calculateInvestmentReturn({
      purchasePrice: 300_000_000,
      currentPrice: 350_000_000,
      totalInvestment: 300_000_000,
      annualRentalIncome: 12_000_000,
      annualExpenses: 2_000_000,
      holdingYears: 3,
      loanAmount: 0,
      loanInterestRate: 0,
    })
    expect(result.annualLoanInterest).toBe(0)
    expect(result.totalLoanInterest).toBe(0)
    // totalProfit = 50M + 30M - 0 = 80M
    expect(result.totalProfit).toBe(80_000_000)
    // roi = 80M / 300M * 100 ≈ 26.67%
    expect(result.roi).toBeCloseTo(26.67, 1)
    expect(result.leverageEffect).toBe(1)
  })

  it('시세 하락 시 → 음수 수익', () => {
    const result = calculateInvestmentReturn({
      purchasePrice: 500_000_000,
      currentPrice: 400_000_000,
      totalInvestment: 200_000_000,
      annualRentalIncome: 12_000_000,
      annualExpenses: 2_000_000,
      holdingYears: 3,
      loanAmount: 300_000_000,
      loanInterestRate: 5,
    })
    // totalGain = -100M
    expect(result.totalGain).toBe(-100_000_000)
    // netRentalIncome = 10M, totalRentalIncome = 30M
    // annualLoanInterest = 15M, totalLoanInterest = 45M
    // totalProfit = -100M + 30M - 45M = -115M
    expect(result.totalProfit).toBe(-115_000_000)
    // roi = -115M / 200M * 100 = -57.5%
    expect(result.roi).toBe(-57.5)
  })

  it('매입가 0원 → 에러', () => {
    expect(() =>
      calculateInvestmentReturn({
        purchasePrice: 0,
        currentPrice: 100_000_000,
        totalInvestment: 100_000_000,
        annualRentalIncome: 0,
        annualExpenses: 0,
        holdingYears: 1,
        loanAmount: 0,
        loanInterestRate: 0,
      })
    ).toThrow()
  })

  it('보유기간 0년 → 에러', () => {
    expect(() =>
      calculateInvestmentReturn({
        purchasePrice: 500_000_000,
        currentPrice: 500_000_000,
        totalInvestment: 200_000_000,
        annualRentalIncome: 0,
        annualExpenses: 0,
        holdingYears: 0,
        loanAmount: 0,
        loanInterestRate: 0,
      })
    ).toThrow()
  })
})
