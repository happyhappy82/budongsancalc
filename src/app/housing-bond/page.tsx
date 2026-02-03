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
  calculateHousingBond,
  type Region,
  type AreaSize,
} from '@/lib/calculators/housing-bond'
import { formatKRW, formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function HousingBondPage() {
  const [salePrice, setSalePrice] = useState(0)
  const [region, setRegion] = useState<Region>('서울')
  const [areaSize, setAreaSize] = useState<AreaSize>('60㎡이하')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateHousingBond({
        salePrice,
        region,
        areaSize,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '국민주택채권 매입 정보',
          results: [
            {
              label: '실제 부담액',
              value: result.actualBurden,
              formatted: formatManWon(result.actualBurden),
              description: '채권매입액 - 할인비용',
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            {
              label: '채권매입금액',
              value: result.bondPurchaseAmount,
              formatted: formatKRW(result.bondPurchaseAmount),
              description: `매입비율 ${result.purchaseRate}/1000`,
            },
            {
              label: '할인비용',
              value: result.discountCost,
              formatted: formatKRW(result.discountCost),
              description: '채권매입액의 약 6%',
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
        국민주택채권 계산기
      </h1>

      <CalculatorCard
        title="국민주택채권 매입비용 계산"
        description="부동산 등기 시 의무 매입해야 하는 국민주택채권의 실제 부담액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매매가격"
            value={salePrice}
            onChange={setSalePrice}
            suffix="원"
            placeholder="500,000,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">소재지역</Label>
            <Select value={region} onValueChange={(v) => setRegion(v as Region)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="광역시">광역시</SelectItem>
                <SelectItem value="시지역">시지역</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">전용면적</Label>
            <Select
              value={areaSize}
              onValueChange={(v) => setAreaSize(v as AreaSize)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60㎡이하">60㎡ 이하</SelectItem>
                <SelectItem value="60~85㎡">60㎡ 초과 ~ 85㎡ 이하</SelectItem>
                <SelectItem value="85㎡초과">85㎡ 초과</SelectItem>
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
      <InfoSection slug="housing-bond" />
      <Disclaimer />
    </div>
  )
}
