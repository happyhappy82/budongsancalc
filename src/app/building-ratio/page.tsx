'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateBuildingRatio } from '@/lib/calculators/building-ratio'
import { formatPercent, formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function BuildingRatioPage() {
  const [landArea, setLandArea] = useState(0)
  const [buildingArea, setBuildingArea] = useState(0)
  const [totalFloorArea, setTotalFloorArea] = useState(0)
  const [floors, setFloors] = useState(1)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateBuildingRatio({
        landArea,
        buildingArea,
        totalFloorArea,
        floors,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '건폐율 · 용적률',
          results: [
            {
              label: '건폐율',
              value: result.buildingCoverageRatio,
              formatted: formatPercent(result.buildingCoverageRatio),
              description: '건축면적 / 대지면적',
            },
            {
              label: '용적률',
              value: result.floorAreaRatio,
              formatted: formatPercent(result.floorAreaRatio),
              description: '연면적 / 대지면적',
            },
            {
              label: '평균 층별면적',
              value: result.avgFloorArea,
              formatted: `${formatNumber(result.avgFloorArea)}㎡`,
              description: '연면적 / 층수',
            },
          ],
        },
        {
          title: '면적 정보',
          results: [
            {
              label: '대지면적',
              value: result.landAreaSqm,
              formatted: `${formatNumber(result.landAreaSqm)}㎡ (${formatNumber(result.landAreaPyeong)}평)`,
            },
            {
              label: '건축면적',
              value: result.buildingAreaSqm,
              formatted: `${formatNumber(result.buildingAreaSqm)}㎡ (${formatNumber(result.buildingAreaPyeong)}평)`,
              description: '1층 바닥면적',
            },
            {
              label: '연면적',
              value: result.totalFloorAreaSqm,
              formatted: `${formatNumber(result.totalFloorAreaSqm)}㎡ (${formatNumber(result.totalFloorAreaPyeong)}평)`,
              description: '전체 층 바닥면적 합계',
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
      <h1 className="text-2xl font-bold text-foreground">건폐율·용적률 계산기</h1>

      <CalculatorCard
        title="건폐율·용적률 계산"
        description="대지면적 대비 건축면적 비율(건폐율)과 연면적 비율(용적률)을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="대지면적"
            value={landArea}
            onChange={setLandArea}
            suffix="㎡"
            placeholder="300"
          />

          <NumberInput
            label="건축면적 (1층 면적)"
            value={buildingArea}
            onChange={setBuildingArea}
            suffix="㎡"
            placeholder="180"
          />

          <NumberInput
            label="연면적"
            value={totalFloorArea}
            onChange={setTotalFloorArea}
            suffix="㎡"
            placeholder="540"
            helpText="전체 층 바닥면적의 합계"
          />

          <NumberInput
            label="층수"
            value={floors}
            onChange={setFloors}
            suffix="층"
            placeholder="3"
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
      <InfoSection slug="building-ratio" />
      <Disclaimer />
    </div>
  )
}
