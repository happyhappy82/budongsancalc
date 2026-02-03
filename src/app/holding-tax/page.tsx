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
import { calculateHoldingTax } from '@/lib/calculators/holding-tax'
import { formatManWon, formatKRW } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function HoldingTaxPage() {
  const [publicPrice, setPublicPrice] = useState(0)
  const [isSingleHousehold, setIsSingleHousehold] = useState(true)
  const [housingCount, setHousingCount] = useState<1 | 2 | 3>(1)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateHoldingTax({
        publicPrice,
        isSingleHousehold,
        housingCount,
      })

      setSections([
        {
          title: '보유세 계산 결과',
          results: [
            {
              label: '총 보유세',
              value: result.totalHoldingTax,
              formatted: formatKRW(result.totalHoldingTax),
            },
            {
              label: '재산세',
              value: result.propertyTax,
              formatted: formatKRW(result.propertyTax),
            },
            {
              label: '도시지역분 (재산세 × 0.14)',
              value: result.urbanTax,
              formatted: formatKRW(result.urbanTax),
            },
            {
              label: '지방교육세 (재산세 × 0.2)',
              value: result.educationTax,
              formatted: formatKRW(result.educationTax),
            },
            {
              label: '종합부동산세',
              value: result.comprehensiveTax,
              formatted: formatKRW(result.comprehensiveTax),
            },
            {
              label: '농어촌특별세 (종부세 × 0.2)',
              value: result.ruralTax,
              formatted: formatKRW(result.ruralTax),
            },
          ],
        },
        {
          title: '과세표준',
          results: [
            {
              label: '재산세 과세표준',
              value: result.taxBase,
              formatted: `${formatKRW(result.taxBase)} (공시가격 × 60%)`,
            },
            {
              label: '종부세 과세표준',
              value: result.comprehensiveTaxBase,
              formatted:
                result.comprehensiveTaxBase > 0
                  ? `${formatKRW(result.comprehensiveTaxBase)} (공제 후 × 60%)`
                  : '0원 (공제액 이하)',
            },
            {
              label: '종부세 공제액',
              value: isSingleHousehold && housingCount === 1 ? 1200 : 900,
              formatted:
                isSingleHousehold && housingCount === 1
                  ? '12억원 (1세대1주택)'
                  : '9억원',
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '공시가격',
              value: publicPrice,
              formatted: formatManWon(publicPrice),
            },
            {
              label: '1세대1주택 여부',
              value: 0,
              formatted: isSingleHousehold ? '예' : '아니오',
            },
            {
              label: '주택 수',
              value: housingCount,
              formatted: housingCount === 3 ? '3주택 이상' : `${housingCount}주택`,
            },
          ],
        },
        {
          title: '세율 정보',
          results: [
            {
              label: '재산세',
              value: 0,
              formatted: isSingleHousehold
                ? '0.05%~0.35% (1세대1주택 특례)'
                : '0.1%~0.4% (일반)',
            },
            {
              label: '종부세',
              value: 0,
              formatted:
                housingCount >= 3
                  ? '0.5%~5% (3주택 이상 중과)'
                  : '0.5%~2.7% (2주택 이하)',
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
      <h1 className="text-2xl font-bold text-foreground">보유세 계산기</h1>

      <CalculatorCard
        title="보유세 (재산세 + 종합부동산세) 계산"
        description="주택 보유에 따른 재산세와 종합부동산세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="공시가격"
            value={publicPrice}
            onChange={setPublicPrice}
            suffix="만원"
            placeholder="100,000"
            helpText="주택공시가격을 입력하세요 (10억원 = 100,000만원)"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">1세대1주택 여부</Label>
            <Select
              value={isSingleHousehold ? 'yes' : 'no'}
              onValueChange={(v) => setIsSingleHousehold(v === 'yes')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">예 (1세대1주택 특례 적용)</SelectItem>
                <SelectItem value="no">아니오</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">주택 수</Label>
            <Select
              value={String(housingCount)}
              onValueChange={(v) => setHousingCount(Number(v) as 1 | 2 | 3)}
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
            <p className="text-xs text-muted-foreground mt-1">
              3주택 이상은 종합부동산세 중과세율이 적용됩니다
            </p>
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
      <InfoSection slug="holding-tax" />
      <Disclaimer />
    </div>
  )
}
