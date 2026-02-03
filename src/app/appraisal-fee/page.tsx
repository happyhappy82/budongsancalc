'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateAppraisalFee } from '@/lib/calculators/appraisal-fee'
import { formatKRW, formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function AppraisalFeePage() {
  const [appraisalValue, setAppraisalValue] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAppraisalFee({ appraisalValue })

      const resultSections: CalculatorSection[] = [
        {
          title: '총 수수료',
          results: [
            {
              label: '총 감정평가수수료',
              value: result.totalFee,
              formatted: formatManWon(result.totalFee),
              description: '부가세 포함',
            },
          ],
        },
        {
          title: '수수료 세부 내역',
          results: [
            {
              label: '기본수수료',
              value: result.baseFee,
              formatted: formatKRW(result.baseFee),
            },
            {
              label: '부가세',
              value: result.vat,
              formatted: formatKRW(result.vat),
              description: '기본수수료의 10%',
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
        감정평가수수료 계산기
      </h1>

      <CalculatorCard
        title="감정평가수수료 계산"
        description="부동산 감정평가 의뢰 시 발생하는 감정평가수수료를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="감정평가액"
            value={appraisalValue}
            onChange={setAppraisalValue}
            suffix="원"
            placeholder="500,000,000"
            helpText="감정평가를 받을 부동산의 예상 가액을 입력하세요"
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
      <InfoSection slug="appraisal-fee" />
      <Disclaimer />
    </div>
  )
}
