'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateStampTax } from '@/lib/calculators/stamp-tax'
import { formatKRW, formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function StampTaxPage() {
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateStampTax({ transactionAmount })

      const getTaxDescription = (amount: number): string => {
        if (amount <= 10_000_000) return '1천만원 이하 비과세'
        if (amount <= 30_000_000) return '3천만원 이하'
        if (amount <= 50_000_000) return '5천만원 이하'
        if (amount <= 100_000_000) return '1억원 이하'
        if (amount <= 1_000_000_000) return '10억원 이하'
        return '10억원 초과'
      }

      const resultSections: CalculatorSection[] = [
        {
          title: '인지세 계산 결과',
          results: [
            {
              label: '인지세액',
              value: result.stampTax,
              formatted:
                result.stampTax === 0
                  ? '비과세'
                  : formatKRW(result.stampTax),
              description: getTaxDescription(transactionAmount),
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
      <h1 className="text-2xl font-bold text-foreground">인지세 계산기</h1>

      <CalculatorCard
        title="인지세 계산"
        description="부동산 거래계약서 작성 시 납부해야 하는 인지세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="거래금액"
            value={transactionAmount}
            onChange={setTransactionAmount}
            suffix="원"
            placeholder="100,000,000"
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
      <InfoSection slug="stamp-tax" />
      <Disclaimer />
    </div>
  )
}
