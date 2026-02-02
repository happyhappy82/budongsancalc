'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { Button } from '@/components/ui/button'
import { calculatePropertyTax } from '@/lib/calculators/property-tax'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function PropertyTaxPage() {
  const [assessedValue, setAssessedValue] = useState(0)
  const [isUrbanArea, setIsUrbanArea] = useState(true)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculatePropertyTax({
        assessedValue,
        isUrbanArea,
      })

      setSections([
        {
          title: '재산세 합계',
          results: [
            {
              label: '총 납부세액',
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
          title: '세부 내역',
          results: [
            {
              label: '과세표준',
              value: result.taxBase,
              formatted: formatManWon(result.taxBase),
              description: '공시가격 x 공정시장가액비율(60%)',
            },
            {
              label: '재산세',
              value: result.propertyTax,
              formatted: formatKRW(result.propertyTax),
              description: '누진세율 적용',
            },
            {
              label: '도시지역분',
              value: result.cityPlanningTax,
              formatted: formatKRW(result.cityPlanningTax),
              description: isUrbanArea
                ? '과세표준의 0.14%'
                : '비도시지역 비과세',
            },
            {
              label: '지방교육세',
              value: result.localEducationTax,
              formatted: formatKRW(result.localEducationTax),
              description: '재산세의 20%',
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
      <h1 className="text-2xl font-bold text-foreground">재산세 계산기</h1>

      <CalculatorCard
        title="재산세 계산"
        description="주택 공시가격을 기준으로 재산세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="주택 공시가격"
            value={assessedValue}
            onChange={setAssessedValue}
            suffix="원"
            placeholder="500,000,000"
            helpText="국토교통부 공시가격 기준"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isUrbanArea}
              onChange={(e) => setIsUrbanArea(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">도시지역 (도시지역분 과세)</span>
          </label>

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
      <Disclaimer />
    </div>
  )
}
