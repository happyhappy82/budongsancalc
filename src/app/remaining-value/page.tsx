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
  calculateRemainingValue,
  type StructureType,
} from '@/lib/calculators/remaining-value'
import { formatManWon, formatPercent, formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RemainingValuePage() {
  const [originalValue, setOriginalValue] = useState(0)
  const [elapsedYears, setElapsedYears] = useState(0)
  const [structureType, setStructureType] = useState<StructureType>('rc')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRemainingValue({
        originalValue,
        elapsedYears,
        structureType,
      })

      setSections([
        {
          title: '건물 잔존가치 계산 결과',
          results: [
            {
              label: '잔존가치',
              value: result.remainingValue,
              formatted: formatManWon(result.remainingValue),
              description: '현재 건물의 평가 가치',
            },
            {
              label: '감가상각 누계액',
              value: result.depreciationAmount,
              formatted: formatManWon(result.depreciationAmount),
            },
            {
              label: '감가상각률',
              value: result.depreciationRate,
              formatted: formatPercent(result.depreciationRate),
            },
            {
              label: '신축 가액',
              value: result.originalValue,
              formatted: formatManWon(result.originalValue),
            },
            {
              label: '내용연수',
              value: result.usefulLife,
              formatted: `${formatNumber(result.usefulLife)}년`,
            },
            {
              label: '경과연수',
              value: elapsedYears,
              formatted: `${formatNumber(elapsedYears)}년`,
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
      <h1 className="text-2xl font-bold text-foreground">잔존가치 계산기</h1>

      <CalculatorCard
        title="건물 잔존가치 계산"
        description="건물의 신축가액과 경과연수에 따른 현재 잔존가치를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="건물 신축가액"
            value={originalValue}
            onChange={setOriginalValue}
            suffix="원"
            placeholder="300,000,000"
            helpText="신축 시 건축비 (부가세 제외)"
          />

          <NumberInput
            label="경과연수"
            value={elapsedYears}
            onChange={setElapsedYears}
            suffix="년"
            placeholder="10"
            helpText="사용승인일로부터 경과한 연수"
          />

          <div className="space-y-2">
            <Label>구조 유형</Label>
            <Select
              value={structureType}
              onValueChange={(value) =>
                setStructureType(value as StructureType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rc">철근콘크리트 (RC) - 내용연수 50년</SelectItem>
                <SelectItem value="brick">벽돌조 - 내용연수 40년</SelectItem>
                <SelectItem value="light-steel">
                  경량철골 - 내용연수 30년
                </SelectItem>
                <SelectItem value="container">
                  컨테이너 - 내용연수 20년
                </SelectItem>
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

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          감가상각 방법 안내
        </h3>
        <div className="space-y-1 text-xs text-blue-800">
          <p>
            • 정률법 단순화 방식: 잔존가치 = 신축가액 × (1 - 경과연수/내용연수)
          </p>
          <p>• 최소 잔존가치율: 10% (내용연수 경과 시 신축가액의 10%)</p>
          <p>• 철근콘크리트(RC): 내용연수 50년</p>
          <p>• 벽돌조: 내용연수 40년</p>
          <p>• 경량철골: 내용연수 30년</p>
          <p>• 컨테이너: 내용연수 20년</p>
          <p className="mt-2">
            ※ 실제 감정평가 시 구조, 유지보수 상태, 시장 상황 등 다양한 요소가
            고려됩니다.
          </p>
        </div>
      </div>

      <InfoSection slug="remaining-value" />
      <Disclaimer />
    </div>
  )
}
