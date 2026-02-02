import { describe, it, expect } from 'vitest'
import { calculateLoanRepayment, calculateMaxLoan } from '../loan'

describe('calculateLoanRepayment', () => {
  it('원리금균등: 3억, 4%, 30년 → 월 약 143만', () => {
    const result = calculateLoanRepayment({
      loanAmount: 300_000_000,
      annualRate: 4,
      loanTermYears: 30,
      repaymentMethod: 'equal-principal-interest',
    })
    expect(result.monthlyPayment).toBeGreaterThan(1_400_000)
    expect(result.monthlyPayment).toBeLessThan(1_440_000)
    expect(result.totalInterest).toBeGreaterThan(0)
  })

  it('원금균등: 3억, 4%, 30년 → 첫달 약 183만', () => {
    const result = calculateLoanRepayment({
      loanAmount: 300_000_000,
      annualRate: 4,
      loanTermYears: 30,
      repaymentMethod: 'equal-principal',
    })
    expect(result.monthlyPayment).toBeGreaterThan(1_800_000)
    expect(result.monthlyPayment).toBeLessThan(1_850_000)
  })

  it('만기일시: 3억, 4% → 월 이자 100만', () => {
    const result = calculateLoanRepayment({
      loanAmount: 300_000_000,
      annualRate: 4,
      loanTermYears: 30,
      repaymentMethod: 'bullet',
    })
    expect(result.schedule[0].interest).toBe(1_000_000)
    expect(result.schedule[0].principal).toBe(0)
  })

  it('금리 0% → 원금만 상환', () => {
    const result = calculateLoanRepayment({
      loanAmount: 120_000_000,
      annualRate: 0,
      loanTermYears: 10,
      repaymentMethod: 'equal-principal-interest',
    })
    expect(result.totalInterest).toBe(0)
    expect(result.monthlyPayment).toBe(1_000_000)
  })

  it('대출기간 0이면 에러', () => {
    expect(() =>
      calculateLoanRepayment({
        loanAmount: 300_000_000,
        annualRate: 4,
        loanTermYears: 0,
        repaymentMethod: 'equal-principal-interest',
      })
    ).toThrow()
  })
})

describe('calculateMaxLoan', () => {
  it('LTV 70% → 10억 담보 시 최대 7억', () => {
    const result = calculateMaxLoan(
      {
        propertyValue: 1_000_000_000,
        annualIncome: 100_000_000,
        otherDebtPayment: 0,
        region: 'non-capital',
        isFirstTimeBuyer: false,
        financialInstitution: 'first',
      },
      30,
      4
    )
    expect(result.maxLoanByLtv).toBe(700_000_000)
  })

  it('생애최초 → LTV 80%', () => {
    const result = calculateMaxLoan(
      {
        propertyValue: 1_000_000_000,
        annualIncome: 100_000_000,
        otherDebtPayment: 0,
        region: 'capital',
        isFirstTimeBuyer: true,
        financialInstitution: 'first',
      },
      30,
      4
    )
    expect(result.maxLoanByLtv).toBe(800_000_000)
  })
})
