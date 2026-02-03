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
  calculateRegionalTax,
  type BuildingType,
} from '@/lib/calculators/regional-tax'
import { formatManWon, formatKRW } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RegionalTaxPage() {
  const [buildingValue, setBuildingValue] = useState(0)
  const [buildingType, setBuildingType] = useState<BuildingType>('주택')
  const [isSingleHousehold, setIsSingleHousehold] = useState(false)
  const [isFireRisk, setIsFireRisk] = useState(false)
  const [isLargeFireRisk, setIsLargeFireRisk] = useState(false)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRegionalTax({
        buildingValue,
        buildingType,
        isSingleHousehold,
        isFireRisk,
        isLargeFireRisk,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '총 세액',
          results: [
            {
              label: '지역자원시설세 총액',
              value: result.totalTax,
              formatted: formatManWon(result.totalTax),
              description:
                result.multiplier > 1
                  ? `${result.multiplier}배 부과`
                  : '소방분',
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            {
              label: '건물 시가표준액',
              value: buildingValue,
              formatted: formatManWon(buildingValue),
            },
            {
              label: '과세표준',
              value: result.taxableBase,
              formatted: formatManWon(result.taxableBase),
              description:
                buildingType === '주택' && isSingleHousehold
                  ? '1세대1주택 비과세'
                  : undefined,
            },
            {
              label: '기본세액',
              value: result.baseTax,
              formatted: formatKRW(result.baseTax),
              description: '소방분',
            },
            ...(result.additionalTax > 0
              ? [
                  {
                    label: '가산세액',
                    value: result.additionalTax,
                    formatted: formatKRW(result.additionalTax),
                    description: isLargeFireRisk
                      ? '대형화재위험건축물 (기본세액 × 2)'
                      : '화재위험건축물 (기본세액 × 1)',
                  },
                ]
              : []),
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
        지역자원시설세 계산기
      </h1>

      <CalculatorCard
        title="지역자원시설세 계산"
        description="건축물에 부과되는 지역자원시설세(소방분)를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="건물 시가표준액"
            value={buildingValue}
            onChange={setBuildingValue}
            suffix="원"
            placeholder="100,000,000"
            helpText="건축물의 시가표준액을 입력하세요"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">건물 유형</Label>
            <Select
              value={buildingType}
              onValueChange={(v) => setBuildingType(v as BuildingType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="주택">주택</SelectItem>
                <SelectItem value="그외">그외 (상가, 오피스텔 등)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {buildingType === '주택' && (
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
                  <SelectItem value="no">아니오</SelectItem>
                  <SelectItem value="yes">예 (비과세)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              화재위험건축물 지정 여부
            </Label>
            <Select
              value={
                isLargeFireRisk ? 'large' : isFireRisk ? 'normal' : 'none'
              }
              onValueChange={(v) => {
                setIsFireRisk(v === 'normal' || v === 'large')
                setIsLargeFireRisk(v === 'large')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">해당없음</SelectItem>
                <SelectItem value="normal">화재위험건축물 (2배)</SelectItem>
                <SelectItem value="large">
                  대형화재위험건축물 (3배)
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
      <InfoSection slug="regional-tax" />
      <Disclaimer />
    </div>
  )
}
