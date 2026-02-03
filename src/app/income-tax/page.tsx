'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateIncomeTax } from '@/lib/calculators/income-tax'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function IncomeTaxPage() {
  const [rentalIncome, setRentalIncome] = useState(0)
  const [otherIncome, setOtherIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [dependents, setDependents] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateIncomeTax({
        rentalIncome,
        otherIncome,
        expenses,
        dependents,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '종합소득세 합계',
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
              label: '종합소득금액',
              value: result.totalIncome,
              formatted: formatManWon(result.totalIncome),
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
              label: '지방소득세',
              value: result.localIncomeTax,
              formatted: formatManWon(result.localIncomeTax),
              description: '산출세액의 10%',
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
      <h1 className="text-2xl font-bold text-foreground">종합소득세 계산기</h1>

      <CalculatorCard
        title="종합소득세 계산"
        description="임대소득 및 기타소득에 대한 종합소득세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="임대소득"
            value={rentalIncome}
            onChange={setRentalIncome}
            suffix="원"
            placeholder="30,000,000"
          />

          <NumberInput
            label="기타소득"
            value={otherIncome}
            onChange={setOtherIncome}
            suffix="원"
            placeholder="10,000,000"
          />

          <NumberInput
            label="필요경비"
            value={expenses}
            onChange={setExpenses}
            suffix="원"
            placeholder="5,000,000"
          />

          <NumberInput
            label="부양가족수"
            value={dependents}
            onChange={setDependents}
            suffix="명"
            placeholder="2"
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
      <InfoSection slug="income-tax" />
      <Disclaimer />
    </div>
  )
}
