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
import { calculateAttorneyFee } from '@/lib/calculators/attorney-fee'
import { formatManWon, formatKRW } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function AttorneyFeePage() {
  const [propertyPrice, setPropertyPrice] = useState(0)
  const [propertyType, setPropertyType] = useState<'주택' | '그외건물'>('주택')
  const [includePublicCosts, setIncludePublicCosts] = useState(true)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAttorneyFee({
        propertyPrice,
        propertyType,
        includePublicCosts,
      })

      setSections([
        {
          title: '법무사 보수',
          results: [
            {
              label: '법무사 기본보수',
              value: result.baseFee,
              formatted: formatKRW(result.baseFee),
              description: '등기 업무 수수료',
            },
          ],
        },
        {
          title: '공공비용 (수입인지·증지)',
          results: [
            {
              label: '수입인지',
              value: result.revenueSeal,
              formatted: formatKRW(result.revenueSeal),
              description: '등록면허세 납부용',
            },
            {
              label: '수입증지',
              value: result.registrationSeal,
              formatted: formatKRW(result.registrationSeal),
              description: '등기 1건당 15,000원',
            },
            {
              label: '공공비용 소계',
              value: result.publicCosts,
              formatted: formatKRW(result.publicCosts),
            },
          ],
        },
        {
          title: '제반비용',
          results: [
            {
              label: '교통비 등 제반비용',
              value: result.miscellaneousCosts,
              formatted: formatKRW(result.miscellaneousCosts),
              description: '등기소 방문, 서류 발급 등',
            },
          ],
        },
        {
          title: '총 비용',
          results: [
            {
              label: '총 법무사 비용',
              value: result.totalFee,
              formatted: formatKRW(result.totalFee),
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '부동산 가액',
              value: propertyPrice,
              formatted: formatManWon(propertyPrice),
            },
            {
              label: '부동산 유형',
              value: 0,
              formatted: propertyType,
            },
            {
              label: '공공비용 포함',
              value: 0,
              formatted: includePublicCosts ? '포함' : '제외',
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
      <h1 className="text-2xl font-bold text-foreground">법무사보수 계산기</h1>

      <CalculatorCard
        title="법무사 보수 계산"
        description="부동산 등기 시 법무사에게 지불하는 보수 및 공공비용을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="부동산 가액"
            value={propertyPrice}
            onChange={setPropertyPrice}
            suffix="만원"
            placeholder="50,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">부동산 유형</Label>
            <Select
              value={propertyType}
              onValueChange={(v) => setPropertyType(v as '주택' | '그외건물')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="주택">주택</SelectItem>
                <SelectItem value="그외건물">그외 건물</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={includePublicCosts}
                onChange={(e) => setIncludePublicCosts(e.target.checked)}
                className="w-4 h-4"
              />
              공공비용 포함 (수입인지, 수입증지)
            </Label>
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

      <CalculatorCard
        title="법무사 보수 안내"
        description="부동산 가액에 따른 누진 구조입니다."
      >
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">부동산 가액</div>
            <div className="font-medium">보수 계산식</div>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>1천만원 이하</div>
              <div>6만원</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>1천만원~5천만원</div>
              <div>6만원 + 초과분 × 0.12%</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>5천만원~1억원</div>
              <div>10.8만원 + 초과분 × 0.09%</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>1억원~3억원</div>
              <div>15.3만원 + 초과분 × 0.06%</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>3억원~5억원</div>
              <div>27.3만원 + 초과분 × 0.05%</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>5억원~10억원</div>
              <div>37.3만원 + 초과분 × 0.04%</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>10억원 초과</div>
              <div>57.3만원 + 초과분 × 0.02%</div>
            </div>
          </div>
        </div>
      </CalculatorCard>

      <InfoSection slug="attorney-fee" />
      <Disclaimer />
    </div>
  )
}
