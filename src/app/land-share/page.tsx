'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateLandShare } from '@/lib/calculators/land-share'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function LandSharePage() {
  const [totalLandArea, setTotalLandArea] = useState(0)
  const [totalBuildingArea, setTotalBuildingArea] = useState(0)
  const [unitArea, setUnitArea] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateLandShare({
        totalLandArea,
        totalBuildingArea,
        unitArea,
      })

      setSections([
        {
          title: '대지지분 계산 결과',
          results: [
            {
              label: '대지지분 (㎡)',
              value: result.landShareSqm,
              formatted: `${formatNumber(result.landShareSqm)}㎡`,
            },
            {
              label: '대지지분 (평)',
              value: result.landSharePyeong,
              formatted: `${formatNumber(result.landSharePyeong)}평`,
            },
            {
              label: '지분비율',
              value: result.shareRatio,
              formatted: formatPercent(result.shareRatio),
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
      <h1 className="text-2xl font-bold text-foreground">대지지분 계산기</h1>

      <CalculatorCard
        title="대지지분 계산"
        description="아파트나 다세대주택의 대지지분을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="대지면적"
            value={totalLandArea}
            onChange={setTotalLandArea}
            suffix="㎡"
            placeholder="1000"
            helpText="건물이 위치한 전체 대지면적"
          />

          <NumberInput
            label="전체연면적"
            value={totalBuildingArea}
            onChange={setTotalBuildingArea}
            suffix="㎡"
            placeholder="5000"
            helpText="건물 전체의 연면적"
          />

          <NumberInput
            label="해당세대 전용면적"
            value={unitArea}
            onChange={setUnitArea}
            suffix="㎡"
            placeholder="84"
            helpText="해당 세대의 전용면적"
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
      <InfoSection slug="land-share" />
      <Disclaimer />
    </div>
  )
}
