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
import { calculateSavingsInterest } from '@/lib/calculators/savings-interest'
import { formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'
import type { InterestType, TaxType } from '@/lib/calculators/savings-interest'

export default function SavingsInterestPage() {
  const [principal, setPrincipal] = useState(0)
  const [annualRate, setAnnualRate] = useState(0)
  const [months, setMonths] = useState(0)
  const [interestType, setInterestType] = useState<InterestType>('simple')
  const [taxType, setTaxType] = useState<TaxType>('general')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateSavingsInterest({
        principal,
        annualRate,
        months,
        interestType,
        taxType,
      })

      setSections([
        {
          title: '이자 계산 결과',
          results: [
            {
              label: '세후 수령액',
              value: result.totalAfterTax,
              formatted: formatManWon(result.totalAfterTax),
              description: '원금 + 세후이자',
            },
            {
              label: '세전이자',
              value: result.interestBeforeTax,
              formatted: formatManWon(result.interestBeforeTax),
            },
            {
              label: '이자과세',
              value: result.interestTax,
              formatted: formatManWon(result.interestTax),
            },
            {
              label: '세후이자',
              value: result.interestAfterTax,
              formatted: formatManWon(result.interestAfterTax),
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
      <h1 className="text-2xl font-bold text-foreground">예적금이자 계산기</h1>

      <CalculatorCard
        title="예적금 이자 계산"
        description="예금 및 적금의 이자를 계산하고 세후 수령액을 확인합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="원금"
            value={principal}
            onChange={setPrincipal}
            suffix="원"
            placeholder="10,000,000"
          />

          <NumberInput
            label="연이율"
            value={annualRate}
            onChange={setAnnualRate}
            suffix="%"
            placeholder="3.5"
          />

          <NumberInput
            label="기간"
            value={months}
            onChange={setMonths}
            suffix="개월"
            placeholder="12"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">이자유형</Label>
            <Select value={interestType} onValueChange={(v) => setInterestType(v as InterestType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">단리</SelectItem>
                <SelectItem value="compound">복리</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">과세유형</Label>
            <Select value={taxType} onValueChange={(v) => setTaxType(v as TaxType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">일반과세 (15.4%)</SelectItem>
                <SelectItem value="preferential">세금우대 (9.5%)</SelectItem>
                <SelectItem value="tax-free">비과세 (0%)</SelectItem>
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
      <InfoSection slug="savings-interest" />
      <Disclaimer />
    </div>
  )
}
