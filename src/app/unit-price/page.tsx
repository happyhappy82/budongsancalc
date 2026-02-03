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
import { calculateUnitPrice } from '@/lib/calculators/unit-price'
import { formatKRW, formatManWon, formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function UnitPricePage() {
  const [totalPrice, setTotalPrice] = useState(0)
  const [area, setArea] = useState(0)
  const [unit, setUnit] = useState<'sqm' | 'pyeong'>('pyeong')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateUnitPrice({
        totalPrice,
        area,
        unit,
      })

      setSections([
        {
          title: '단위가격 계산 결과',
          results: [
            {
              label: '평당 가격',
              value: result.pricePerPyeong,
              formatted: formatManWon(result.pricePerPyeong),
            },
            {
              label: '㎡당 가격',
              value: result.pricePerSqm,
              formatted: formatKRW(result.pricePerSqm),
            },
            {
              label: '면적 (평)',
              value: result.areaPyeong,
              formatted: `${formatNumber(result.areaPyeong)}평`,
            },
            {
              label: '면적 (㎡)',
              value: result.areaSqm,
              formatted: `${formatNumber(result.areaSqm)}㎡`,
            },
            {
              label: '총 금액',
              value: totalPrice,
              formatted: formatManWon(totalPrice),
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
      <h1 className="text-2xl font-bold text-foreground">단위가격 계산기</h1>

      <CalculatorCard
        title="단위가격 계산"
        description="총 금액과 면적을 입력하여 평당/㎡당 가격을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="총 금액"
            value={totalPrice}
            onChange={setTotalPrice}
            suffix="원"
            placeholder="500,000,000"
          />

          <div className="space-y-2">
            <Label>면적 단위</Label>
            <Select
              value={unit}
              onValueChange={(value) => setUnit(value as 'sqm' | 'pyeong')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pyeong">평</SelectItem>
                <SelectItem value="sqm">㎡ (제곱미터)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="면적"
            value={area}
            onChange={setArea}
            suffix={unit === 'pyeong' ? '평' : '㎡'}
            placeholder={unit === 'pyeong' ? '30' : '99'}
            helpText="1평 = 3.305785㎡"
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
      <InfoSection slug="unit-price" />
      <Disclaimer />
    </div>
  )
}
