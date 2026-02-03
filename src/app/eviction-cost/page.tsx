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
  calculateEvictionCost,
  type EvictionRegion,
} from '@/lib/calculators/eviction-cost'
import { formatKRW, formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function EvictionCostPage() {
  const [area, setArea] = useState(0)
  const [region, setRegion] = useState<EvictionRegion>('서울')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateEvictionCost({ area, region })

      const resultSections: CalculatorSection[] = [
        {
          title: '총 명도비용',
          results: [
            {
              label: '총 비용',
              value: result.totalCost,
              formatted: formatManWon(result.totalCost),
            },
          ],
        },
        {
          title: '세부 비용 내역',
          results: [
            {
              label: '인도명령신청비',
              value: result.applicationFee,
              formatted: formatKRW(result.applicationFee),
              description: '신청수수료',
            },
            {
              label: '송달료',
              value: result.deliveryFee,
              formatted: formatKRW(result.deliveryFee),
              description: '2회분',
            },
            {
              label: '집행관수수료',
              value: result.executorFee,
              formatted: formatKRW(result.executorFee),
              description: '기본 수수료',
            },
            {
              label: '집행비용',
              value: result.executionCost,
              formatted: formatKRW(result.executionCost),
              description: '인건비 + 차량비',
            },
            {
              label: '보관비용',
              value: result.storageFee,
              formatted: formatKRW(result.storageFee),
              description: '예상 비용',
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
      <h1 className="text-2xl font-bold text-foreground">명도비용 계산기</h1>

      <CalculatorCard
        title="명도비용 계산"
        description="경매 낙찰 후 점유자를 내보내기 위한 명도비용을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="부동산 면적"
            value={area}
            onChange={setArea}
            suffix="㎡"
            placeholder="85"
            helpText="전용면적을 입력하세요"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">소재지역</Label>
            <Select
              value={region}
              onValueChange={(v) => setRegion(v as EvictionRegion)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="경기">경기</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
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
      <InfoSection slug="eviction-cost" />
      <Disclaimer />
    </div>
  )
}
