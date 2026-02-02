import { describe, it, expect } from 'vitest'
import {
  calculateAcquisitionTax,
  getAcquisitionTaxRate,
} from '../acquisition-tax'

describe('getAcquisitionTaxRate', () => {
  it('1주택 5억 → 1%', () => {
    expect(getAcquisitionTaxRate(500_000_000, 1, false)).toBe(0.01)
  })

  it('1주택 6억 → 1%', () => {
    expect(getAcquisitionTaxRate(600_000_000, 1, false)).toBe(0.01)
  })

  it('1주택 7.5억 → 2% (선형보간)', () => {
    const rate = getAcquisitionTaxRate(750_000_000, 1, false)
    expect(rate).toBeCloseTo(0.02, 4)
  })

  it('1주택 9억 → 3%', () => {
    expect(getAcquisitionTaxRate(900_000_000, 1, false)).toBe(0.03)
  })

  it('2주택 조정지역 → 8%', () => {
    expect(getAcquisitionTaxRate(500_000_000, 2, true)).toBe(0.08)
  })

  it('3주택 조정지역 → 12%', () => {
    expect(getAcquisitionTaxRate(500_000_000, 3, true)).toBe(0.12)
  })

  it('3주택 비조정 → 8%', () => {
    expect(getAcquisitionTaxRate(500_000_000, 3, false)).toBe(0.08)
  })
})

describe('calculateAcquisitionTax', () => {
  it('1주택 5억 비조정 → 취득세 500만, 교육세 50만', () => {
    const result = calculateAcquisitionTax({
      purchasePrice: 500_000_000,
      housingCount: 1,
      isRegulated: false,
      isFirstTimeBuyer: false,
    })
    expect(result.acquisitionTax).toBe(5_000_000)
    expect(result.localEducationTax).toBe(500_000)
    expect(result.ruralSpecialTax).toBe(0)
  })

  it('1주택 10억 → 취득세 3%', () => {
    const result = calculateAcquisitionTax({
      purchasePrice: 1_000_000_000,
      housingCount: 1,
      isRegulated: false,
      isFirstTimeBuyer: false,
    })
    expect(result.acquisitionTax).toBe(30_000_000)
  })

  it('생애최초 1주택 5억 → 200만원 감면', () => {
    const result = calculateAcquisitionTax({
      purchasePrice: 500_000_000,
      housingCount: 1,
      isRegulated: false,
      isFirstTimeBuyer: true,
    })
    expect(result.firstTimeBuyerDiscount).toBe(2_000_000)
    expect(result.acquisitionTax).toBe(3_000_000)
  })

  it('2주택 5억 조정지역 → 취득세 8%', () => {
    const result = calculateAcquisitionTax({
      purchasePrice: 500_000_000,
      housingCount: 2,
      isRegulated: true,
      isFirstTimeBuyer: false,
    })
    expect(result.acquisitionTax).toBe(40_000_000)
  })
})
