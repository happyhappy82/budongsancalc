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
import { calculateGoodLandlord } from '@/lib/calculators/good-landlord'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function GoodLandlordPage() {
  const [previousRent, setPreviousRent] = useState(0)
  const [reducedRent, setReducedRent] = useState(0)
  const [monthsReduced, setMonthsReduced] = useState(12)
  const [taxRate, setTaxRate] = useState<number>(24)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateGoodLandlord({
        previousRent,
        reducedRent,
        monthsReduced,
        taxRate,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '세액공제 혜택',
          results: [
            {
              label: '세액공제액 (70%)',
              value: result.taxCredit,
              formatted: formatManWon(result.taxCredit),
              description: '총인하액의 70%',
            },
            {
              label: '실질절세액',
              value: result.actualTaxSavings,
              formatted: formatManWon(result.actualTaxSavings),
              description: `세율 ${taxRate}% 적용 시`,
            },
            {
              label: '순부담감소액',
              value: result.netBurdenReduction,
              formatted: formatManWon(result.netBurdenReduction),
              description: '임대인 입장 실제 부담 감소액',
            },
          ],
        },
        {
          title: '월세 인하 내역',
          results: [
            {
              label: '월세 인하액',
              value: result.rentReduction,
              formatted: formatManWon(result.rentReduction),
              description: '월 기준',
            },
            {
              label: '총 인하액',
              value: result.totalReduction,
              formatted: formatManWon(result.totalReduction),
              description: `${monthsReduced}개월 누적`,
            },
            {
              label: '기존 월세',
              value: previousRent,
              formatted: formatManWon(previousRent),
            },
            {
              label: '인하된 월세',
              value: reducedRent,
              formatted: formatManWon(reducedRent),
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
      <h1 className="text-2xl font-bold text-foreground">
        착한임대인 세액공제 계산기
      </h1>

      <CalculatorCard
        title="착한임대인 세액공제 계산"
        description="월세를 인하한 임대인에게 제공되는 세액공제 혜택을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="기존 월세"
            value={previousRent}
            onChange={setPreviousRent}
            suffix="원/월"
            placeholder="1,000,000"
          />

          <NumberInput
            label="인하된 월세"
            value={reducedRent}
            onChange={setReducedRent}
            suffix="원/월"
            placeholder="800,000"
          />

          <NumberInput
            label="인하 개월수"
            value={monthsReduced}
            onChange={setMonthsReduced}
            suffix="개월"
            placeholder="12"
            helpText="최대 12개월"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">소득세율</Label>
            <Select
              value={taxRate.toString()}
              onValueChange={(v) => setTaxRate(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6% (1,200만원 이하)</SelectItem>
                <SelectItem value="15">15% (1,200~4,600만원)</SelectItem>
                <SelectItem value="24">24% (4,600~8,800만원)</SelectItem>
                <SelectItem value="35">35% (8,800~1.5억원)</SelectItem>
                <SelectItem value="38">38% (1.5~3억원)</SelectItem>
                <SelectItem value="40">40% (3~5억원)</SelectItem>
                <SelectItem value="42">42% (5~10억원)</SelectItem>
                <SelectItem value="45">45% (10억원 초과)</SelectItem>
              </SelectContent>
            </Select>
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
      <InfoSection slug="good-landlord" />
      <Disclaimer />
    </div>
  )
}
