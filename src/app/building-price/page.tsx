'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateBuildingPrice } from '@/lib/calculators/building-price'
import { formatManWon, formatKRW, formatNumber } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function BuildingPricePage() {
  const [area, setArea] = useState(0)
  const [constructionPricePerSqm, setConstructionPricePerSqm] = useState(880000)
  const [structureIndex, setStructureIndex] = useState(1.0)
  const [useIndex, setUseIndex] = useState(1.0)
  const [locationIndex, setLocationIndex] = useState(1.0)
  const [ageRate, setAgeRate] = useState(90)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateBuildingPrice({
        area,
        constructionPricePerSqm,
        structureIndex,
        useIndex,
        locationIndex,
        ageRate,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '건물기준시가',
          results: [
            {
              label: '기준시가',
              value: result.standardPrice,
              formatted: formatManWon(result.standardPrice),
              description: '면적 × ㎡당 금액',
            },
          ],
        },
        {
          title: '단위당 금액',
          results: [
            {
              label: '㎡당 금액',
              value: result.pricePerSqm,
              formatted: formatKRW(result.pricePerSqm),
            },
            {
              label: '평당 금액',
              value: result.pricePerPyeong,
              formatted: formatKRW(result.pricePerPyeong),
            },
          ],
        },
        {
          title: '적용 지수',
          results: [
            {
              label: '건물신축가격기준액',
              value: constructionPricePerSqm,
              formatted: `${formatNumber(constructionPricePerSqm)}원/㎡`,
            },
            {
              label: '구조지수',
              value: structureIndex,
              formatted: formatNumber(structureIndex),
            },
            {
              label: '용도지수',
              value: useIndex,
              formatted: formatNumber(useIndex),
            },
            {
              label: '위치지수',
              value: locationIndex,
              formatted: formatNumber(locationIndex),
            },
            {
              label: '경과연수별잔가율',
              value: ageRate,
              formatted: `${formatNumber(ageRate)}%`,
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
      <h1 className="text-2xl font-bold text-foreground">건물기준시가 계산기</h1>

      <CalculatorCard
        title="건물기준시가 계산"
        description="건물의 과세표준 산정을 위한 기준시가를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="면적"
            value={area}
            onChange={setArea}
            suffix="㎡"
            placeholder="100"
          />

          <NumberInput
            label="건물신축가격기준액"
            value={constructionPricePerSqm}
            onChange={setConstructionPricePerSqm}
            suffix="원/㎡"
            placeholder="880000"
            helpText="국세청 고시 기준 (2024년 기준)"
          />

          <NumberInput
            label="구조지수"
            value={structureIndex}
            onChange={setStructureIndex}
            placeholder="1.0"
            helpText="철근콘크리트: 1.0, 철골: 1.1, 목조: 0.7 등"
          />

          <NumberInput
            label="용도지수"
            value={useIndex}
            onChange={setUseIndex}
            placeholder="1.0"
            helpText="주거용: 1.0, 상업용: 1.1, 공업용: 0.9 등"
          />

          <NumberInput
            label="위치지수"
            value={locationIndex}
            onChange={setLocationIndex}
            placeholder="1.0"
            helpText="도심: 1.1, 일반: 1.0, 외곽: 0.9 등"
          />

          <NumberInput
            label="경과연수별잔가율"
            value={ageRate}
            onChange={setAgeRate}
            suffix="%"
            placeholder="90"
            helpText="신축: 100%, 5년: 90%, 10년: 80% 등"
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
      <InfoSection slug="building-price" />
      <Disclaimer />
    </div>
  )
}
