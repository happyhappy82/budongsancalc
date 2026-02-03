'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateOverdueInterest } from '@/lib/calculators/overdue-interest'
import { formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function OverdueInterestPage() {
  const [overdueAmount, setOverdueAmount] = useState(0)
  const [annualRate, setAnnualRate] = useState(12)
  const [days, setDays] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateOverdueInterest({ overdueAmount, annualRate, days })

      setSections([
        {
          title: '연체이자 계산 결과',
          results: [
            {
              label: '총 상환금액',
              value: result.totalAmount,
              formatted: formatManWon(result.totalAmount),
              description: '원금 + 연체이자',
            },
            {
              label: '연체이자',
              value: result.overdueInterest,
              formatted: formatManWon(result.overdueInterest),
            },
            {
              label: '연체금액 (원금)',
              value: overdueAmount,
              formatted: formatManWon(overdueAmount),
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">연체이자 계산기</h1>

      <CalculatorCard
        title="연체이자 계산"
        description="연체금액과 연체기간에 따른 연체이자를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="연체금액"
            value={overdueAmount}
            onChange={setOverdueAmount}
            suffix="원"
            placeholder="1,000,000"
          />

          <NumberInput
            label="연체이율"
            value={annualRate}
            onChange={setAnnualRate}
            suffix="%"
            placeholder="12"
            helpText="일반적으로 연 12% 적용"
          />

          <NumberInput
            label="연체일수"
            value={days}
            onChange={setDays}
            suffix="일"
            placeholder="30"
          />

          <Button onClick={handleCalculate} className="w-full">
            계산하기
          </Button>
        </div>
      </CalculatorCard>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ResultDisplay sections={sections} />
      <InfoSection slug="overdue-interest" />
      <Disclaimer />
    </div>
  )
}
