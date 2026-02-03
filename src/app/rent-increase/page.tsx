'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateRentIncrease } from '@/lib/calculators/rent-increase'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RentIncreasePage() {
  const [currentDeposit, setCurrentDeposit] = useState(0)
  const [currentRent, setCurrentRent] = useState(0)
  const [conversionRate, setConversionRate] = useState(4.5)
  const [increaseRate, setIncreaseRate] = useState(5)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRentIncrease({
        currentDeposit,
        currentRent,
        conversionRate,
        increaseRate,
      })

      setSections([
        {
          title: '방법 1: 전월세전환방식',
          results: [
            {
              label: '인상 후 보증금',
              value: result.method1.newDeposit,
              formatted: formatManWon(result.method1.newDeposit),
            },
            {
              label: '인상 후 월세',
              value: result.method1.newRent,
              formatted: formatKRW(result.method1.newRent),
            },
            {
              label: '보증금 인상액',
              value: result.method1.depositIncrease,
              formatted: formatManWon(result.method1.depositIncrease),
            },
            {
              label: '월세 인상액',
              value: result.method1.rentIncrease,
              formatted: formatKRW(result.method1.rentIncrease),
            },
          ],
        },
        {
          title: '방법 2: 각각인상방식',
          results: [
            {
              label: '인상 후 보증금',
              value: result.method2.newDeposit,
              formatted: formatManWon(result.method2.newDeposit),
            },
            {
              label: '인상 후 월세',
              value: result.method2.newRent,
              formatted: formatKRW(result.method2.newRent),
            },
            {
              label: '보증금 인상액',
              value: result.method2.depositIncrease,
              formatted: formatManWon(result.method2.depositIncrease),
            },
            {
              label: '월세 인상액',
              value: result.method2.rentIncrease,
              formatted: formatKRW(result.method2.rentIncrease),
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
        임대료 상승분 계산기
      </h1>

      <CalculatorCard
        title="임대료 인상한도 계산"
        description="주택임대차보호법에 따른 임대료 인상한도를 두 가지 방식으로 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="현재 보증금"
            value={currentDeposit}
            onChange={setCurrentDeposit}
            suffix="원"
            placeholder="10,000,000"
          />

          <NumberInput
            label="현재 월세"
            value={currentRent}
            onChange={setCurrentRent}
            suffix="원"
            placeholder="500,000"
          />

          <NumberInput
            label="전환율"
            value={conversionRate}
            onChange={setConversionRate}
            suffix="%"
            placeholder="4.5"
            helpText="기준 전환율 (2.5~5.5%)"
          />

          <NumberInput
            label="인상률"
            value={increaseRate}
            onChange={setIncreaseRate}
            suffix="%"
            placeholder="5"
            helpText="주택임대차보호법상 최대 5%"
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

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          임대료 인상 방식 설명
        </h3>
        <div className="space-y-2 text-xs text-blue-800">
          <p>
            <strong>방법 1 (전월세전환방식):</strong> 보증금과 월세를 전환율로
            환산한 총액에 인상률을 적용
          </p>
          <p>
            <strong>방법 2 (각각인상방식):</strong> 보증금과 월세에 각각
            인상률을 적용
          </p>
          <p className="mt-2">
            주택임대차보호법상 임대료 인상한도는 연 5%이며, 임대인은 두 방식 중
            하나를 선택할 수 있습니다.
          </p>
        </div>
      </div>

      <InfoSection slug="rent-increase" />
      <Disclaimer />
    </div>
  )
}
