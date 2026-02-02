'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { Button } from '@/components/ui/button'
import { calculateComprehensiveTax } from '@/lib/calculators/comprehensive-tax'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function ComprehensiveTaxPage() {
  const [totalAssessedValue, setTotalAssessedValue] = useState(0)
  const [isSingleHomeOwner, setIsSingleHomeOwner] = useState(true)
  const [ownerAge, setOwnerAge] = useState(0)
  const [holdingYears, setHoldingYears] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateComprehensiveTax({
        totalAssessedValue,
        isSingleHomeOwner,
        ownerAge,
        holdingYears,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '종합부동산세 합계',
          results: [
            {
              label: '총 납부세액',
              value: result.totalTax,
              formatted: formatManWon(result.totalTax),
            },
            {
              label: '실효세율',
              value: result.effectiveRate,
              formatted: `${result.effectiveRate}%`,
            },
          ],
        },
        {
          title: '과세 기준',
          results: [
            {
              label: '기본공제',
              value: result.deduction,
              formatted: formatManWon(result.deduction),
              description: isSingleHomeOwner
                ? '1세대1주택 12억원'
                : '일반 9억원',
            },
            {
              label: '과세표준',
              value: result.taxBase,
              formatted: formatManWon(result.taxBase),
              description: '(공시가격 합산 - 기본공제) x 60%',
            },
            {
              label: '산출세액',
              value: result.calculatedTax,
              formatted: formatKRW(result.calculatedTax),
            },
          ],
        },
      ]

      if (isSingleHomeOwner && result.totalDeductionRate > 0) {
        resultSections.push({
          title: '세액공제 (1세대1주택)',
          results: [
            {
              label: '고령자 공제',
              value: result.ageDeductionRate,
              formatted: formatPercent(result.ageDeductionRate),
              description:
                ownerAge >= 70
                  ? '70세 이상'
                  : ownerAge >= 65
                    ? '65~70세'
                    : ownerAge >= 60
                      ? '60~65세'
                      : '60세 미만',
            },
            {
              label: '장기보유 공제',
              value: result.holdingDeductionRate,
              formatted: formatPercent(result.holdingDeductionRate),
              description:
                holdingYears >= 15
                  ? '15년 이상'
                  : holdingYears >= 10
                    ? '10~15년'
                    : holdingYears >= 5
                      ? '5~10년'
                      : '5년 미만',
            },
            {
              label: '합산 공제율',
              value: result.totalDeductionRate,
              formatted: formatPercent(result.totalDeductionRate),
              description: '최대 80%',
            },
            {
              label: '세액공제액',
              value: result.taxDeduction,
              formatted: `-${formatKRW(result.taxDeduction)}`,
            },
          ],
        })
      }

      resultSections.push({
        title: '세부 내역',
        results: [
          {
            label: '종합부동산세',
            value: result.comprehensiveTax,
            formatted: formatKRW(result.comprehensiveTax),
          },
          {
            label: '지방교육세',
            value: result.localEducationTax,
            formatted: formatKRW(result.localEducationTax),
            description: '종부세의 20%',
          },
        ],
      })

      setSections(resultSections)
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">종합부동산세 계산기</h1>

      <CalculatorCard
        title="종합부동산세 계산"
        description="주택 공시가격 합산액을 기준으로 종합부동산세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="주택 공시가격 합산"
            value={totalAssessedValue}
            onChange={setTotalAssessedValue}
            suffix="원"
            placeholder="2,000,000,000"
            helpText="보유 주택의 공시가격 합산액"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSingleHomeOwner}
              onChange={(e) => setIsSingleHomeOwner(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">1세대 1주택자</span>
          </label>

          {isSingleHomeOwner && (
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="소유자 나이"
                value={ownerAge}
                onChange={setOwnerAge}
                suffix="세"
                max={120}
                helpText="고령자 공제 (60세 이상)"
              />
              <NumberInput
                label="보유기간"
                value={holdingYears}
                onChange={setHoldingYears}
                suffix="년"
                max={100}
                helpText="장기보유 공제 (5년 이상)"
              />
            </div>
          )}

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
      <Disclaimer />
    </div>
  )
}
