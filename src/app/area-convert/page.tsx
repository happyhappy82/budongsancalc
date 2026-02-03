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
import { calculateAreaConvert } from '@/lib/calculators/area-convert'
import { formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'
import type { AreaUnit } from '@/lib/calculators/area-convert'

export default function AreaConvertPage() {
  const [value, setValue] = useState(0)
  const [fromUnit, setFromUnit] = useState<AreaUnit>('pyeong')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAreaConvert({ value, fromUnit })

      setSections([
        {
          title: '환산 결과',
          results: [
            {
              label: '평 (pyeong)',
              value: result.pyeong,
              formatted: `${formatNumber(result.pyeong)}평`,
            },
            {
              label: '제곱미터 (㎡)',
              value: result.sqm,
              formatted: `${formatNumber(result.sqm)}㎡`,
            },
            {
              label: '제곱피트 (sqft)',
              value: result.sqft,
              formatted: `${formatNumber(result.sqft)}sqft`,
            },
            {
              label: '에이커 (acre)',
              value: result.acre,
              formatted: `${formatNumber(result.acre)}acre`,
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  const getUnitLabel = (unit: AreaUnit): string => {
    switch (unit) {
      case 'pyeong':
        return '평'
      case 'sqm':
        return '㎡'
      case 'sqft':
        return 'sqft'
      case 'acre':
        return 'acre'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">평수환산 계산기</h1>

      <CalculatorCard
        title="면적 단위 환산"
        description="평, 제곱미터, 제곱피트, 에이커 간 면적을 환산합니다."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">입력 단위</Label>
            <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as AreaUnit)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pyeong">평 (pyeong)</SelectItem>
                <SelectItem value="sqm">제곱미터 (㎡)</SelectItem>
                <SelectItem value="sqft">제곱피트 (sqft)</SelectItem>
                <SelectItem value="acre">에이커 (acre)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="면적값"
            value={value}
            onChange={setValue}
            suffix={getUnitLabel(fromUnit)}
            placeholder="100"
          />

          <Button onClick={handleCalculate} className="w-full">
            환산하기
          </Button>
        </div>
      </CalculatorCard>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ResultDisplay sections={sections} />
      <InfoSection slug="area-convert" />
      <Disclaimer />
    </div>
  )
}
