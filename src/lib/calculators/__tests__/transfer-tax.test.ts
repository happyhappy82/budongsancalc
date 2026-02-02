import { describe, it, expect } from 'vitest'
import { calculateTransferTax } from '../transfer-tax'

describe('calculateTransferTax', () => {
  it('1세대1주택 비과세 (12억 이하, 2년 보유+거주)', () => {
    const result = calculateTransferTax({
      acquisitionPrice: 500_000_000,
      transferPrice: 800_000_000,
      expenses: 5_000_000,
      holdingYears: 3,
      residenceYears: 3,
      housingCount: 1,
      isSingleHousehold: true,
      isRegulated: false,
    })
    expect(result.isTaxExempt).toBe(true)
    expect(result.totalTax).toBe(0)
  })

  it('양도차익 없음(손실) → 세금 0', () => {
    const result = calculateTransferTax({
      acquisitionPrice: 800_000_000,
      transferPrice: 700_000_000,
      expenses: 5_000_000,
      holdingYears: 5,
      residenceYears: 0,
      housingCount: 2,
      isSingleHousehold: false,
      isRegulated: false,
    })
    expect(result.totalTax).toBe(0)
    expect(result.capitalGain).toBeLessThan(0)
  })

  it('단기보유 1년미만 → 45% 세율', () => {
    const result = calculateTransferTax({
      acquisitionPrice: 500_000_000,
      transferPrice: 600_000_000,
      expenses: 0,
      holdingYears: 0,
      residenceYears: 0,
      housingCount: 2,
      isSingleHousehold: false,
      isRegulated: false,
    })
    expect(result.taxRate).toBe(45)
  })

  it('기본공제 250만원 적용', () => {
    const result = calculateTransferTax({
      acquisitionPrice: 500_000_000,
      transferPrice: 600_000_000,
      expenses: 0,
      holdingYears: 3,
      residenceYears: 0,
      housingCount: 2,
      isSingleHousehold: false,
      isRegulated: false,
    })
    expect(result.taxBase).toBeLessThan(result.taxableIncome)
  })

  it('1세대1주택 고가주택(15억) → 12억 초과분만 과세', () => {
    const result = calculateTransferTax({
      acquisitionPrice: 1_000_000_000,
      transferPrice: 1_500_000_000,
      expenses: 0,
      holdingYears: 5,
      residenceYears: 5,
      housingCount: 1,
      isSingleHousehold: true,
      isRegulated: false,
    })
    expect(result.isTaxExempt).toBe(false)
    expect(result.capitalGain).toBeLessThan(500_000_000)
    expect(result.totalTax).toBeGreaterThan(0)
  })
})
