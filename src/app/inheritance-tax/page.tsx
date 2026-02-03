'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateInheritanceTax } from '@/lib/calculators/inheritance-tax'
import { formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function InheritanceTaxPage() {
  const [estateValue, setEstateValue] = useState(0)
  const [hasSpouse, setHasSpouse] = useState(false)
  const [childrenCount, setChildrenCount] = useState(0)
  const [debtAmount, setDebtAmount] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateInheritanceTax({
        estateValue,
        hasSpouse,
        childrenCount,
        debtAmount,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '상속세 합계',
          results: [
            {
              label: '최종 납부세액',
              value: result.finalTax,
              formatted: formatManWon(result.finalTax),
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            {
              label: '상속재산가액',
              value: result.estateValue,
              formatted: formatManWon(result.estateValue),
              description: debtAmount > 0 ? '채무 차감 후' : '',
            },
            {
              label: '총 공제액',
              value: result.totalDeduction,
              formatted: formatManWon(result.totalDeduction),
              description: hasSpouse ? '배우자공제 포함' : '일괄공제',
            },
            {
              label: '과세표준',
              value: result.taxableIncome,
              formatted: formatManWon(result.taxableIncome),
            },
            {
              label: '산출세액',
              value: result.calculatedTax,
              formatted: formatManWon(result.calculatedTax),
            },
            {
              label: '신고세액공제',
              value: result.reportingDiscount,
              formatted: `-${formatManWon(result.reportingDiscount)}`,
              description: '산출세액의 3%',
            },
          ],
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
      <h1 className="text-2xl font-bold text-foreground">상속세 계산기</h1>

      <CalculatorCard
        title="상속세 계산"
        description="상속재산에 대한 상속세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="상속재산가액"
            value={estateValue}
            onChange={setEstateValue}
            suffix="원"
            placeholder="1,000,000,000"
          />

          <NumberInput
            label="채무액"
            value={debtAmount}
            onChange={setDebtAmount}
            suffix="원"
            placeholder="0"
          />

          <NumberInput
            label="자녀수"
            value={childrenCount}
            onChange={setChildrenCount}
            suffix="명"
            placeholder="2"
          />

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpouse}
                onChange={(e) => setHasSpouse(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">배우자 있음</span>
            </label>
          </div>

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
      <InfoSection slug="inheritance-tax" />
      <Disclaimer />
    </div>
  )
}
