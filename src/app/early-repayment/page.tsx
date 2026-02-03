'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateEarlyRepayment } from '@/lib/calculators/early-repayment'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function EarlyRepaymentPage() {
  const [repaymentAmount, setRepaymentAmount] = useState(0)
  const [feeRate, setFeeRate] = useState(0.58)
  const [remainingDays, setRemainingDays] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateEarlyRepayment({
        repaymentAmount,
        feeRate,
        remainingDays,
        totalDays,
      })

      setSections([
        {
          title: '중도상환 수수료',
          results: [
            {
              label: '중도상환수수료',
              value: result.earlyRepaymentFee,
              formatted: formatManWon(result.earlyRepaymentFee),
            },
            {
              label: '실수령액',
              value: result.netAmount,
              formatted: formatManWon(result.netAmount),
              description: '상환금액 - 수수료',
            },
          ],
        },
        {
          title: '계산 내역',
          results: [
            {
              label: '중도상환금액',
              value: result.repaymentAmount,
              formatted: formatManWon(result.repaymentAmount),
            },
            {
              label: '수수료율',
              value: result.feeRate,
              formatted: formatPercent(result.feeRate),
            },
            {
              label: '일수비율',
              value: result.dayRatio * 100,
              formatted: `${(result.dayRatio * 100).toFixed(2)}%`,
              description: `${remainingDays}일 / ${totalDays}일`,
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
        중도상환수수료 계산기
      </h1>

      <CalculatorCard
        title="중도상환수수료 계산"
        description="대출 중도상환 시 발생하는 수수료를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="중도상환금액"
            value={repaymentAmount}
            onChange={setRepaymentAmount}
            suffix="원"
            placeholder="100,000,000"
          />

          <NumberInput
            label="수수료율"
            value={feeRate}
            onChange={setFeeRate}
            suffix="%"
            placeholder="0.58"
          />

          <NumberInput
            label="대출잔여일수"
            value={remainingDays}
            onChange={setRemainingDays}
            suffix="일"
            placeholder="1095"
          />

          <NumberInput
            label="대출전체기간"
            value={totalDays}
            onChange={setTotalDays}
            suffix="일"
            placeholder="3650"
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
      <InfoSection slug="early-repayment" />
      <Disclaimer />
    </div>
  )
}
