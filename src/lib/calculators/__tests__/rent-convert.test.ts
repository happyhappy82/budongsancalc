import { describe, it, expect } from 'vitest'
import {
  convertJeonseToMonthly,
  convertMonthlyToJeonse,
} from '../rent-convert'

describe('convertJeonseToMonthly', () => {
  it('전세 3억, 월세보증금 1000만, 전환율 4.5% → 월세 약 108만원', () => {
    const result = convertJeonseToMonthly({
      jeonseDeposit: 300_000_000,
      monthlyDeposit: 10_000_000,
      conversionRate: 4.5,
    })
    expect(result.monthlyRent).toBe(1_087_500)
  })

  it('전환율 0이면 에러', () => {
    expect(() =>
      convertJeonseToMonthly({
        jeonseDeposit: 300_000_000,
        monthlyDeposit: 10_000_000,
        conversionRate: 0,
      })
    ).toThrow()
  })

  it('월세보증금이 전세금보다 크면 에러', () => {
    expect(() =>
      convertJeonseToMonthly({
        jeonseDeposit: 100_000_000,
        monthlyDeposit: 200_000_000,
        conversionRate: 4.5,
      })
    ).toThrow()
  })
})

describe('convertMonthlyToJeonse', () => {
  it('월세보증금 1000만, 월세 100만, 전환율 4.5% → 전세 약 2.77억', () => {
    const result = convertMonthlyToJeonse({
      monthlyDeposit: 10_000_000,
      monthlyRent: 1_000_000,
      conversionRate: 4.5,
    })
    expect(result.jeonseEquivalent).toBe(276_666_667)
  })

  it('월세 0이면 에러', () => {
    expect(() =>
      convertMonthlyToJeonse({
        monthlyDeposit: 10_000_000,
        monthlyRent: 0,
        conversionRate: 4.5,
      })
    ).toThrow()
  })
})
