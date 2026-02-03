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
import { calculateDeemedRental } from '@/lib/calculators/deemed-rental'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'
import type { CalculatorResult } from '@/lib/types/calculator'

export default function DeemedRentalPage() {
  const [deposit, setDeposit] = useState(0)
  const [rentalDays, setRentalDays] = useState(365)
  const [interestRate, setInterestRate] = useState(3.5)
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>(
    'residential'
  )
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateDeemedRental({
        deposit,
        rentalDays,
        interestRate,
        propertyType,
      })

      const baseResults: CalculatorResult[] = [
        {
          label: '간주임대료',
          value: result.deemedRental,
          formatted: formatManWon(result.deemedRental),
        },
        {
          label: '과세대상 보증금',
          value: result.taxableDeposit,
          formatted: formatManWon(result.taxableDeposit),
          description:
            propertyType === 'residential'
              ? '3억 초과분'
              : '전액 과세',
        },
        {
          label: '적용 이자율',
          value: result.appliedRate,
          formatted: formatPercent(result.appliedRate),
        },
      ]

      if (propertyType === 'residential' && deposit < 300_000_000) {
        baseResults.unshift({
          label: '안내',
          value: 0,
          formatted: '주거용 보증금 3억 미만은 과세대상이 아닙니다',
        })
      }

      const resultSections: CalculatorSection[] = [
        {
          title: '간주임대료 계산 결과',
          results: baseResults,
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
      <h1 className="text-2xl font-bold text-foreground">간주임대료 계산기</h1>

      <CalculatorCard
        title="간주임대료 계산"
        description="보증금에 대한 간주임대료를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="보증금"
            value={deposit}
            onChange={setDeposit}
            suffix="원"
            placeholder="300,000,000"
          />

          <NumberInput
            label="임대기간 (일수)"
            value={rentalDays}
            onChange={setRentalDays}
            suffix="일"
            placeholder="365"
          />

          <NumberInput
            label="이자율"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            placeholder="3.5"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">부동산 유형</Label>
            <Select
              value={propertyType}
              onValueChange={(v) =>
                setPropertyType(v as 'residential' | 'commercial')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">주거용</SelectItem>
                <SelectItem value="commercial">상업용</SelectItem>
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
      <InfoSection slug="deemed-rental" />
      <Disclaimer />
    </div>
  )
}
