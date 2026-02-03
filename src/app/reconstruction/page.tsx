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
  calculateReconstruction,
  type BuildingType,
} from '@/lib/calculators/reconstruction'
import { formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function ReconstructionPage() {
  const [approvalYear, setApprovalYear] = useState(0)
  const [buildingType, setBuildingType] = useState<BuildingType>('rc')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateReconstruction({
        approvalYear,
        buildingType,
      })

      const canReconstructNow = result.remainingYears === 0

      setSections([
        {
          title: '재건축 연한 계산 결과',
          results: [
            {
              label: '재건축 가능 연도',
              value: result.reconstructionYear,
              formatted: `${formatNumber(result.reconstructionYear)}년`,
              description: `기준 ${result.standardYears}년 경과`,
            },
            {
              label: '조기 재건축 가능 연도',
              value: result.earlyReconstructionYear,
              formatted: `${formatNumber(result.earlyReconstructionYear)}년`,
              description: `안전진단 통과 시 최소 ${result.minimumYears}년`,
            },
            {
              label: '현재 경과 연수',
              value: result.elapsedYears,
              formatted: `${formatNumber(result.elapsedYears)}년`,
            },
            {
              label: '남은 연수',
              value: result.remainingYears,
              formatted: `${formatNumber(result.remainingYears)}년`,
              description: canReconstructNow
                ? '재건축 가능'
                : `${result.remainingYears}년 후 재건축 가능`,
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  const buildingTypeLabel = (type: BuildingType): string => {
    const labels: Record<BuildingType, string> = {
      rc: '철근콘크리트 (RC)',
      brick: '벽돌조',
      wood: '목조',
      steel: '철골조',
    }
    return labels[type]
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">재건축 연한 계산기</h1>

      <CalculatorCard
        title="재건축 가능 시기 계산"
        description="건물 사용승인일과 구조에 따른 재건축 가능 시기를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="사용승인일"
            value={approvalYear}
            onChange={setApprovalYear}
            suffix="년"
            placeholder="1990"
            helpText="건축물대장의 사용승인일 연도"
          />

          <div className="space-y-2">
            <Label>건물 유형</Label>
            <Select
              value={buildingType}
              onValueChange={(value) => setBuildingType(value as BuildingType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rc">
                  철근콘크리트 (RC) - 기준 40년
                </SelectItem>
                <SelectItem value="brick">벽돌조 - 기준 30년</SelectItem>
                <SelectItem value="wood">목조 - 기준 20년</SelectItem>
                <SelectItem value="steel">철골조 - 기준 30년</SelectItem>
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
          재건축 연한 기준
        </h3>
        <div className="space-y-1 text-xs text-blue-800">
          <p>• 철근콘크리트: 40년 (안전진단 통과 시 최소 30년)</p>
          <p>• 벽돌조: 30년 (안전진단 통과 시 최소 20년)</p>
          <p>• 목조: 20년 (안전진단 통과 시 최소 15년)</p>
          <p>• 철골조: 30년 (안전진단 통과 시 최소 20년)</p>
          <p className="mt-2">
            ※ 조기 재건축은 안전진단을 통과해야 하며, 지역별 조례에 따라 기준이
            다를 수 있습니다.
          </p>
        </div>
      </div>

      <InfoSection slug="reconstruction" />
      <Disclaimer />
    </div>
  )
}
