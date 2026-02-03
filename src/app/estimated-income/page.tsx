'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calculateEstimatedIncome } from '@/lib/calculators/estimated-income'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function EstimatedIncomePage() {
  const [incomeType, setIncomeType] = useState<'국민연금' | '건강보험'>(
    '국민연금'
  )
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateEstimatedIncome({
        incomeType,
        monthlyPayment,
      })

      setSections([
        {
          title: '추정 소득',
          results: [
            {
              label: '월 추정소득',
              value: result.monthlyEstimatedIncome,
              formatted: formatManWon(result.monthlyEstimatedIncome),
            },
            {
              label: '연 추정소득',
              value: result.annualEstimatedIncome,
              formatted: formatManWon(result.annualEstimatedIncome),
            },
          ],
        },
        {
          title: '계산 정보',
          results: [
            {
              label: '소득유형',
              value: 0,
              formatted: result.incomeType,
            },
            {
              label: '적용요율',
              value: result.appliedRate,
              formatted: formatPercent(result.appliedRate),
            },
            {
              label: '월납입액',
              value: monthlyPayment,
              formatted: formatManWon(monthlyPayment),
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
      <h1 className="text-2xl font-bold text-foreground">추정소득 계산기</h1>

      <CalculatorCard
        title="추정소득 계산"
        description="국민연금 또는 건강보험 납입액을 기반으로 소득을 추정합니다."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">소득유형</Label>
            <Select
              value={incomeType}
              onValueChange={(v) =>
                setIncomeType(v as '국민연금' | '건강보험')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="국민연금">
                  국민연금 (요율 4.5%)
                </SelectItem>
                <SelectItem value="건강보험">
                  건강보험 (요율 7.09%)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="월납입액"
            value={monthlyPayment}
            onChange={setMonthlyPayment}
            suffix="원"
            placeholder="180,000"
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
      <InfoSection slug="estimated-income" />
      <Disclaimer />
    </div>
  )
}
