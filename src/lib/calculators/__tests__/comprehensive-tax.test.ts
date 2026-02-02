import { describe, it, expect } from 'vitest'
import { calculateComprehensiveTax } from '../comprehensive-tax'

describe('calculateComprehensiveTax', () => {
  it('공시가 15억 1세대1주택(60세미만, 3년) → 기본공제 12억, 세액공제 0', () => {
    const result = calculateComprehensiveTax({
      totalAssessedValue: 1_500_000_000,
      isSingleHomeOwner: true,
      ownerAge: 50,
      holdingYears: 3,
    })
    expect(result.deduction).toBe(1_200_000_000)
    // taxableValue = 1.5B - 1.2B = 300M
    // taxBase = 300M * 0.6 = 180M
    // bracket: 0~3억, 180M * 0.005 - 0 = 900_000
    expect(result.taxBase).toBe(180_000_000)
    expect(result.calculatedTax).toBe(900_000)
    expect(result.taxDeduction).toBe(0)
    expect(result.comprehensiveTax).toBe(900_000)
    expect(result.localEducationTax).toBe(180_000)
    expect(result.totalTax).toBe(1_080_000)
  })

  it('공시가 20억 1세대1주택(70세, 15년) → 고령40%+장기50%=80% 공제', () => {
    // 2025 세율: 70세이상 40%, 15년이상 50%, 합산 90% -> 최대 80% 적용
    const result = calculateComprehensiveTax({
      totalAssessedValue: 2_000_000_000,
      isSingleHomeOwner: true,
      ownerAge: 70,
      holdingYears: 15,
    })
    expect(result.deduction).toBe(1_200_000_000)
    // taxableValue = 2B - 1.2B = 800M
    // taxBase = 800M * 0.6 = 480M
    // bracket: 3억~6억, 480M * 0.007 - 600_000 = 3_360_000 - 600_000 = 2_760_000
    expect(result.taxBase).toBe(480_000_000)
    expect(result.calculatedTax).toBe(2_760_000)
    // 70세 → 40% (2025 기준), 15년 → 50%, 합산 90% → 최대 80%
    expect(result.ageDeductionRate).toBe(40)
    expect(result.holdingDeductionRate).toBe(50)
    expect(result.totalDeductionRate).toBe(80)
    expect(result.taxDeduction).toBe(2_208_000) // 2_760_000 * 0.8
    expect(result.comprehensiveTax).toBe(552_000) // 2_760_000 - 2_208_000
  })

  it('공시가 15억 다주택 → 기본공제 9억', () => {
    const result = calculateComprehensiveTax({
      totalAssessedValue: 1_500_000_000,
      isSingleHomeOwner: false,
      ownerAge: 50,
      holdingYears: 10,
    })
    expect(result.deduction).toBe(900_000_000)
    // taxableValue = 1.5B - 0.9B = 600M
    // taxBase = 600M * 0.6 = 360M
    // bracket: 3억~6억, 360M * 0.007 - 600_000 = 2_520_000 - 600_000 = 1_920_000
    expect(result.taxBase).toBe(360_000_000)
    expect(result.calculatedTax).toBe(1_920_000)
    expect(result.taxDeduction).toBe(0) // 다주택 no deduction
  })

  it('공시가 9억 이하 다주택 → 과세표준 0 (면세)', () => {
    const result = calculateComprehensiveTax({
      totalAssessedValue: 900_000_000,
      isSingleHomeOwner: false,
      ownerAge: 50,
      holdingYears: 5,
    })
    expect(result.taxBase).toBe(0)
    expect(result.totalTax).toBe(0)
  })

  it('공시가 12억 이하 1주택 → 과세표준 0 (면세)', () => {
    const result = calculateComprehensiveTax({
      totalAssessedValue: 1_200_000_000,
      isSingleHomeOwner: true,
      ownerAge: 60,
      holdingYears: 10,
    })
    expect(result.taxBase).toBe(0)
    expect(result.totalTax).toBe(0)
  })

  it('0원 입력 → 에러', () => {
    expect(() =>
      calculateComprehensiveTax({
        totalAssessedValue: 0,
        isSingleHomeOwner: true,
        ownerAge: 50,
        holdingYears: 5,
      })
    ).toThrow()
  })
})
