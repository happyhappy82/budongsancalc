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
import { calculateTransferTax } from '@/lib/calculators/transfer-tax'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function TransferTaxPage() {
  const [acquisitionPrice, setAcquisitionPrice] = useState(0)
  const [transferPrice, setTransferPrice] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [holdingYears, setHoldingYears] = useState(0)
  const [residenceYears, setResidenceYears] = useState(0)
  const [housingCount, setHousingCount] = useState(1)
  const [isSingleHousehold, setIsSingleHousehold] = useState(true)
  const [isRegulated, setIsRegulated] = useState(false)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateTransferTax({
        acquisitionPrice,
        transferPrice,
        expenses,
        holdingYears,
        residenceYears,
        housingCount,
        isSingleHousehold,
        isRegulated,
      })

      if (result.isTaxExempt) {
        setSections([
          {
            title: '비과세 대상',
            results: [
              {
                label: '양도소득세',
                value: 0,
                formatted: '비과세 (0원)',
                description: result.taxExemptReason,
              },
            ],
          },
        ])
        return
      }

      if (result.capitalGain <= 0) {
        setSections([
          {
            title: '양도차익 없음',
            results: [
              {
                label: '양도차익',
                value: result.capitalGain,
                formatted: formatManWon(result.capitalGain),
                description: '양도차익이 없어 과세 대상이 아닙니다.',
              },
            ],
          },
        ])
        return
      }

      setSections([
        {
          title: '양도소득세 합계',
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
          title: '양도차익 산정',
          results: [
            {
              label: '양도차익',
              value: result.capitalGain,
              formatted: formatManWon(result.capitalGain),
              description: '양도가 - 취득가 - 필요경비 (고가주택 안분 적용)',
            },
            {
              label: '장기보유특별공제',
              value: result.longTermDeduction,
              formatted: `-${formatManWon(result.longTermDeduction)}`,
              description: `공제율 ${result.longTermDeductionRate}%`,
            },
            {
              label: '양도소득금액',
              value: result.taxableIncome,
              formatted: formatManWon(result.taxableIncome),
            },
            {
              label: '과세표준',
              value: result.taxBase,
              formatted: formatManWon(result.taxBase),
              description: '양도소득금액 - 기본공제 250만원',
            },
          ],
        },
        {
          title: '세액 계산',
          results: [
            {
              label: '적용 세율',
              value: result.taxRate,
              formatted: formatPercent(result.taxRate),
            },
            {
              label: '누진공제',
              value: result.progressiveDeduction,
              formatted: formatKRW(result.progressiveDeduction),
            },
            {
              label: '산출세액',
              value: result.calculatedTax,
              formatted: formatKRW(result.calculatedTax),
            },
            {
              label: '지방소득세',
              value: result.localIncomeTax,
              formatted: formatKRW(result.localIncomeTax),
              description: '산출세액의 10%',
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
      <h1 className="text-2xl font-bold text-foreground">양도소득세 계산기</h1>

      <CalculatorCard
        title="양도소득세 계산"
        description="부동산 매도 시 양도소득세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="취득가격"
            value={acquisitionPrice}
            onChange={setAcquisitionPrice}
            suffix="원"
            placeholder="500,000,000"
          />
          <NumberInput
            label="양도가격"
            value={transferPrice}
            onChange={setTransferPrice}
            suffix="원"
            placeholder="800,000,000"
          />
          <NumberInput
            label="필요경비"
            value={expenses}
            onChange={setExpenses}
            suffix="원"
            placeholder="5,000,000"
            helpText="취득세, 중개수수료, 인테리어 비용 등"
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="보유기간"
              value={holdingYears}
              onChange={setHoldingYears}
              suffix="년"
              max={50}
            />
            <NumberInput
              label="거주기간"
              value={residenceYears}
              onChange={setResidenceYears}
              suffix="년"
              max={50}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">보유 주택 수</Label>
            <Select
              value={String(housingCount)}
              onValueChange={(v) => setHousingCount(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1주택</SelectItem>
                <SelectItem value="2">2주택</SelectItem>
                <SelectItem value="3">3주택 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSingleHousehold}
                onChange={(e) => setIsSingleHousehold(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">1세대 해당</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRegulated}
                onChange={(e) => setIsRegulated(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">조정대상지역</span>
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
