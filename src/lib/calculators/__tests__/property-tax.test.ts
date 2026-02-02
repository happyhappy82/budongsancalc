import { describe, it, expect } from 'vitest'
import { calculatePropertyTax } from '../property-tax'

describe('calculatePropertyTax', () => {
  it('공시가 1억 도시지역 → 과세표준 6천만, 재산세 6만', () => {
    const result = calculatePropertyTax({
      assessedValue: 100_000_000,
      isUrbanArea: true,
    })
    expect(result.taxBase).toBe(60_000_000)
    expect(result.propertyTax).toBe(60_000)
    expect(result.cityPlanningTax).toBe(84_000)
    expect(result.localEducationTax).toBe(12_000)
    expect(result.totalTax).toBe(156_000)
  })

  it('공시가 3억 도시지역 → 과세표준 1.8억', () => {
    const result = calculatePropertyTax({
      assessedValue: 300_000_000,
      isUrbanArea: true,
    })
    expect(result.taxBase).toBe(180_000_000)
    expect(result.propertyTax).toBe(270_000)
  })

  it('공시가 5억 도시지역 → 과세표준 3억', () => {
    const result = calculatePropertyTax({
      assessedValue: 500_000_000,
      isUrbanArea: true,
    })
    expect(result.taxBase).toBe(300_000_000)
    expect(result.propertyTax).toBe(570_000)
  })

  it('공시가 10억 도시지역 → 과세표준 6억', () => {
    const result = calculatePropertyTax({
      assessedValue: 1_000_000_000,
      isUrbanArea: true,
    })
    expect(result.taxBase).toBe(600_000_000)
    expect(result.propertyTax).toBe(1_770_000)
    expect(result.cityPlanningTax).toBe(840_000)
    expect(result.localEducationTax).toBe(354_000)
    expect(result.totalTax).toBe(2_964_000)
  })

  it('비도시지역 → 도시지역분 0', () => {
    const result = calculatePropertyTax({
      assessedValue: 100_000_000,
      isUrbanArea: false,
    })
    expect(result.cityPlanningTax).toBe(0)
    expect(result.totalTax).toBe(72_000)
  })

  it('0원 입력 → 에러', () => {
    expect(() =>
      calculatePropertyTax({ assessedValue: 0, isUrbanArea: true })
    ).toThrow()
  })
})
