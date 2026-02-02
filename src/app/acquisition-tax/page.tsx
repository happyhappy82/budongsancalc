'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calculateAcquisitionTax } from '@/lib/calculators/acquisition-tax'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function AcquisitionTaxPage() {
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [housingCount, setHousingCount] = useState<1 | 2 | 3>(1)
  const [isRegulated, setIsRegulated] = useState(false)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAcquisitionTax({
        purchasePrice,
        housingCount,
        isRegulated,
        isFirstTimeBuyer,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '취득세 합계',
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
              label: '취득세',
              value: result.acquisitionTax,
              formatted: formatKRW(result.acquisitionTax),
              description: `세율 ${formatPercent(result.taxRate)}`,
            },
            {
              label: '지방교육세',
              value: result.localEducationTax,
              formatted: formatKRW(result.localEducationTax),
              description: '취득세의 10%',
            },
            {
              label: '농어촌특별세',
              value: result.ruralSpecialTax,
              formatted: formatKRW(result.ruralSpecialTax),
              description: result.ruralSpecialTax > 0 ? '6억 초과 시 0.2%' : '6억 이하 비과세',
            },
            ...(result.firstTimeBuyerDiscount > 0
              ? [
                  {
                    label: '생애최초 감면',
                    value: result.firstTimeBuyerDiscount,
                    formatted: `-${formatKRW(result.firstTimeBuyerDiscount)}`,
                    description: '최대 200만원 감면',
                  },
                ]
              : []),
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
      <h1 className="text-2xl font-bold text-foreground">취득세 계산기</h1>

      <CalculatorCard
        title="취득세 계산"
        description="부동산 매입 시 납부할 취득세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매매가격"
            value={purchasePrice}
            onChange={setPurchasePrice}
            suffix="원"
            placeholder="500,000,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">보유 주택 수</Label>
            <Select
              value={String(housingCount)}
              onValueChange={(v) => setHousingCount(Number(v) as 1 | 2 | 3)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1주택 (무주택 포함)</SelectItem>
                <SelectItem value="2">2주택</SelectItem>
                <SelectItem value="3">3주택 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegulated}
                onChange={(e) => setIsRegulated(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">조정대상지역</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFirstTimeBuyer}
                onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">생애최초 주택 구입</span>
            </label>
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
      <Disclaimer />
    </div>
  )
}
