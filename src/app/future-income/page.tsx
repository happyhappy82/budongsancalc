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
import {
  calculateFutureIncome,
  AVERAGE_INCOME_BY_AGE,
} from '@/lib/calculators/future-income'
import { formatManWon, formatPercent, formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function FutureIncomePage() {
  const [currentIncome, setCurrentIncome] = useState(0)
  const [age, setAge] = useState(30)
  const [loanTermYears, setLoanTermYears] = useState<10 | 15 | 20 | 30>(10)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateFutureIncome({
        currentIncome,
        age,
        loanTermYears,
      })

      setSections([
        {
          title: '장래소득 계산 결과',
          results: [
            {
              label: '현재 연소득',
              value: result.currentIncome,
              formatted: formatManWon(result.currentIncome),
            },
            {
              label: '장래소득 증가율',
              value: result.growthRate,
              formatted: formatPercent(result.growthRate),
              description:
                result.growthRate === 0
                  ? '35세 이상은 장래소득 증가율이 적용되지 않습니다'
                  : undefined,
            },
            {
              label: '적용 후 연소득',
              value: result.futureIncome,
              formatted: formatManWon(result.futureIncome),
            },
            {
              label: '소득 증가액',
              value: result.incomeIncrease,
              formatted: formatManWon(result.incomeIncrease),
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '현재 연소득',
              value: currentIncome,
              formatted: formatManWon(currentIncome),
            },
            {
              label: '만 나이',
              value: age,
              formatted: `${formatNumber(age)}세`,
            },
            {
              label: '대출만기',
              value: loanTermYears,
              formatted: `${loanTermYears}년`,
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
      <h1 className="text-2xl font-bold text-foreground">
        장래소득 계산기 (DSR)
      </h1>

      <CalculatorCard
        title="장래소득 계산"
        description="DSR 계산 시 적용되는 장래소득 증가율을 반영한 예상 소득을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="현재 연소득"
            value={currentIncome}
            onChange={setCurrentIncome}
            suffix="만원"
            placeholder="4,000"
          />

          <NumberInput
            label="만 나이"
            value={age}
            onChange={setAge}
            suffix="세"
            placeholder="30"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">대출만기</Label>
            <Select
              value={loanTermYears.toString()}
              onValueChange={(v) => setLoanTermYears(Number(v) as 10 | 15 | 20 | 30)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10년</SelectItem>
                <SelectItem value="15">15년</SelectItem>
                <SelectItem value="20">20년</SelectItem>
                <SelectItem value="30">30년</SelectItem>
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

      <CalculatorCard
        title="연령대별 평균소득 참고표"
        description="2024년 기준 연령대별 평균 근로소득입니다."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">연령대</th>
                <th className="text-right py-2 px-3">월평균 (만원)</th>
                <th className="text-right py-2 px-3">연평균 (만원)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(AVERAGE_INCOME_BY_AGE).map(([ageRange, income]) => (
                <tr key={ageRange} className="border-b">
                  <td className="py-2 px-3">{ageRange}세</td>
                  <td className="text-right py-2 px-3">
                    {formatNumber(income.monthly)}
                  </td>
                  <td className="text-right py-2 px-3">
                    {formatNumber(income.yearly)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalculatorCard>

      <InfoSection slug="future-income" />
      <Disclaimer />
    </div>
  )
}
