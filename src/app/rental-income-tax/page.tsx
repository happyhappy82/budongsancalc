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
import { calculateRentalIncomeTax } from '@/lib/calculators/rental-income-tax'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RentalIncomeTaxPage() {
  const [monthlyRent, setMonthlyRent] = useState(0)
  const [deposit, setDeposit] = useState(0)
  const [rentalMonths, setRentalMonths] = useState(12)
  const [isRegistered, setIsRegistered] = useState(true)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRentalIncomeTax({
        monthlyRent,
        deposit,
        rentalMonths,
        isRegistered,
      })

      if (result.annualIncome > 20_000_000) {
        setError(
          '연간 수입금액이 2,000만원을 초과하여 분리과세 대상이 아닙니다. 종합소득세 계산기를 이용해주세요.'
        )
        setSections([])
        return
      }

      const resultSections: CalculatorSection[] = [
        {
          title: '주택임대소득세 (분리과세)',
          results: [
            {
              label: '산출세액',
              value: result.calculatedTax,
              formatted: formatManWon(result.calculatedTax),
              description: '분리과세 14%',
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            {
              label: '연간 수입금액',
              value: result.annualIncome,
              formatted: formatManWon(result.annualIncome),
            },
            {
              label: '필요경비',
              value: result.expenses,
              formatted: formatManWon(result.expenses),
              description: isRegistered ? '수입의 60%' : '수입의 50%',
            },
            {
              label: '기본공제',
              value: result.basicDeduction,
              formatted: formatManWon(result.basicDeduction),
            },
            {
              label: '과세표준',
              value: result.taxableIncome,
              formatted: formatManWon(result.taxableIncome),
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
      <h1 className="text-2xl font-bold text-foreground">
        주택임대소득세 계산기
      </h1>

      <CalculatorCard
        title="주택임대소득세 계산 (분리과세)"
        description="연 2,000만원 이하 주택임대소득에 대한 세액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="월세수입"
            value={monthlyRent}
            onChange={setMonthlyRent}
            suffix="원/월"
            placeholder="1,000,000"
          />

          <NumberInput
            label="보증금"
            value={deposit}
            onChange={setDeposit}
            suffix="원"
            placeholder="50,000,000"
          />

          <NumberInput
            label="임대기간"
            value={rentalMonths}
            onChange={setRentalMonths}
            suffix="개월"
            placeholder="12"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">사업자등록 여부</Label>
            <Select
              value={isRegistered ? 'registered' : 'unregistered'}
              onValueChange={(v) => setIsRegistered(v === 'registered')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">등록 (60% 경비율)</SelectItem>
                <SelectItem value="unregistered">
                  미등록 (50% 경비율)
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
      <InfoSection slug="rental-income-tax" />
      <Disclaimer />
    </div>
  )
}
