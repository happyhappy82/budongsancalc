'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateProgressiveTax } from '@/lib/calculators/progressive-tax'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function ProgressiveTaxPage() {
  const [taxableIncome, setTaxableIncome] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateProgressiveTax({ taxableIncome })

      const resultSections: CalculatorSection[] = [
        {
          title: '누진세 계산 결과',
          results: [
            {
              label: '총 산출세액',
              value: result.totalTax,
              formatted: formatManWon(result.totalTax),
            },
            {
              label: '실효세율',
              value: result.effectiveRate,
              formatted: formatPercent(result.effectiveRate),
            },
          ],
        },
        {
          title: '구간별 세액 상세',
          results: result.brackets.map((bracket) => ({
            label: bracket.bracket,
            value: bracket.taxAmount,
            formatted: formatManWon(bracket.taxAmount),
            description: `${formatManWon(bracket.taxableAmount)} × ${formatPercent(bracket.rate)}`,
          })),
        },
      ]

      setSections(resultSections)
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">누진세 계산기</h1>

      <CalculatorCard
        title="누진세 계산"
        description="과세표준에 대한 누진세를 구간별로 상세하게 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="과세표준"
            value={taxableIncome}
            onChange={setTaxableIncome}
            suffix="원"
            placeholder="50,000,000"
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
      <InfoSection slug="progressive-tax" />
      <Disclaimer />
    </div>
  )
}
