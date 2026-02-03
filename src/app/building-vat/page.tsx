'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateBuildingVat } from '@/lib/calculators/building-vat'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function BuildingVatPage() {
  const [totalPrice, setTotalPrice] = useState(0)
  const [landPrice, setLandPrice] = useState(0)
  const [buildingPrice, setBuildingPrice] = useState(0)
  const [useAutoBuildingPrice, setUseAutoBuildingPrice] = useState(true)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateBuildingVat({
        totalPrice,
        landPrice,
        buildingPrice: useAutoBuildingPrice ? undefined : buildingPrice,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '부가세 계산 결과',
          results: [
            {
              label: '건물분 부가세',
              value: result.vat,
              formatted: formatManWon(result.vat),
              description: '건물가의 10%',
            },
            {
              label: '부가세 포함 총액',
              value: result.totalWithVat,
              formatted: formatManWon(result.totalWithVat),
            },
          ],
        },
        {
          title: '가액 구성',
          results: [
            {
              label: '건물가액',
              value: result.buildingPrice,
              formatted: formatManWon(result.buildingPrice),
            },
            {
              label: '토지가액',
              value: result.landPrice,
              formatted: formatManWon(result.landPrice),
            },
            {
              label: '건물비율',
              value: result.buildingRatio,
              formatted: formatPercent(result.buildingRatio),
              description: '건물가 / 거래총액',
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '거래총액',
              value: totalPrice,
              formatted: formatManWon(totalPrice),
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
      <h1 className="text-2xl font-bold text-foreground">건물분 부가세 계산기</h1>

      <CalculatorCard
        title="건물분 부가세 계산"
        description="부동산 거래 시 건물가액에 대한 부가가치세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="거래총액"
            value={totalPrice}
            onChange={setTotalPrice}
            suffix="원"
            placeholder="500,000,000"
            helpText="토지 + 건물 총 거래가격"
          />

          <NumberInput
            label="토지가"
            value={landPrice}
            onChange={setLandPrice}
            suffix="원"
            placeholder="200,000,000"
          />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useAuto"
                checked={useAutoBuildingPrice}
                onChange={(e) => setUseAutoBuildingPrice(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="useAuto" className="text-sm font-medium">
                건물가 자동계산 (거래총액 - 토지가)
              </label>
            </div>

            {!useAutoBuildingPrice && (
              <NumberInput
                label="건물가 (직접입력)"
                value={buildingPrice}
                onChange={setBuildingPrice}
                suffix="원"
                placeholder="300,000,000"
              />
            )}
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
      <InfoSection slug="building-vat" />
      <Disclaimer />
    </div>
  )
}
