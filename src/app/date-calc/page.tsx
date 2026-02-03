'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { calculateDateDiff } from '@/lib/calculators/date-calc'
import { formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function DateCalcPage() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateDateDiff({ startDate, endDate })

      setSections([
        {
          title: '기간 계산 결과',
          results: [
            {
              label: '총 일수',
              value: result.totalDays,
              formatted: `${formatNumber(result.totalDays)}일`,
            },
            {
              label: '총 개월수',
              value: result.totalMonths,
              formatted: `${formatNumber(result.totalMonths)}개월`,
            },
            {
              label: '총 년수',
              value: result.totalYears,
              formatted: `${formatNumber(result.totalYears)}년`,
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
      <h1 className="text-2xl font-bold text-foreground">날짜 계산기</h1>

      <CalculatorCard
        title="기간 계산"
        description="두 날짜 간의 기간을 일, 개월, 년 단위로 계산합니다."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-date" className="text-sm font-medium">
              시작일
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-sm font-medium">
              종료일
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
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
      <InfoSection slug="date-calc" />
      <Disclaimer />
    </div>
  )
}
