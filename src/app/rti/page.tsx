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
import { calculateRti } from '@/lib/calculators/rti'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RtiPage() {
  const [annualRentalIncome, setAnnualRentalIncome] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [propertyType, setPropertyType] = useState<'주거용' | '비주거용'>(
    '주거용'
  )
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRti({
        annualRentalIncome,
        loanAmount,
        interestRate,
        propertyType,
      })

      setSections([
        {
          title: 'RTI 계산 결과',
          results: [
            {
              label: 'RTI 비율',
              value: result.rtiRatio,
              formatted: result.rtiRatio.toFixed(2),
            },
            {
              label: '기준충족여부',
              value: result.isQualified ? 1 : 0,
              formatted: result.isQualified ? '충족' : '미충족',
              description: `${propertyType} 기준 RTI ${result.requiredRti} 이상 필요`,
            },
          ],
        },
        {
          title: '소득 및 비용',
          results: [
            {
              label: '연간임대소득',
              value: result.annualRentalIncome,
              formatted: formatManWon(result.annualRentalIncome),
            },
            {
              label: '연간이자비용',
              value: result.annualInterestCost,
              formatted: formatManWon(result.annualInterestCost),
            },
          ],
        },
        {
          title: '최대 대출가능액',
          results: [
            {
              label: '최대 대출가능액',
              value: result.maxLoanAmount,
              formatted: formatManWon(result.maxLoanAmount),
              description: `RTI ${result.requiredRti} 기준`,
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
      <h1 className="text-2xl font-bold text-foreground">RTI 계산기</h1>

      <CalculatorCard
        title="RTI (Rent To Interest) 계산"
        description="임대업 이자상환비율(RTI)을 계산하여 대출 적격성을 판단합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="연간임대소득"
            value={annualRentalIncome}
            onChange={setAnnualRentalIncome}
            suffix="원"
            placeholder="30,000,000"
          />

          <NumberInput
            label="대출금액"
            value={loanAmount}
            onChange={setLoanAmount}
            suffix="원"
            placeholder="300,000,000"
          />

          <NumberInput
            label="대출이자율"
            value={interestRate}
            onChange={setInterestRate}
            suffix="%"
            placeholder="4.0"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">부동산유형</Label>
            <Select
              value={propertyType}
              onValueChange={(v) => setPropertyType(v as '주거용' | '비주거용')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="주거용">주거용 (RTI ≥ 1.25)</SelectItem>
                <SelectItem value="비주거용">비주거용 (RTI ≥ 1.5)</SelectItem>
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
      <InfoSection slug="rti" />
      <Disclaimer />
    </div>
  )
}
