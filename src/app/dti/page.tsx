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
import { calculateDti } from '@/lib/calculators/dti'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function DtiPage() {
  const [annualIncome, setAnnualIncome] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanTermMonths, setLoanTermMonths] = useState(360)
  const [loanRate, setLoanRate] = useState(4.0)
  const [repaymentMethod, setRepaymentMethod] = useState<
    '원리금균등' | '원금균등' | '만기일시'
  >('원리금균등')
  const [otherDebtAmount, setOtherDebtAmount] = useState(0)
  const [otherDebtRate, setOtherDebtRate] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateDti({
        annualIncome,
        loanAmount,
        loanTermMonths,
        loanRate,
        repaymentMethod,
        otherDebtAmount,
        otherDebtRate,
      })

      setSections([
        {
          title: 'DTI 계산 결과',
          results: [
            {
              label: 'DTI 비율',
              value: result.dtiRate,
              formatted: formatPercent(result.dtiRate),
            },
            {
              label: '연간 총 상환금액',
              value: result.annualTotalRepay,
              formatted: formatManWon(result.annualTotalRepay),
            },
            {
              label: '대출 연간 상환액',
              value: result.loanAnnualRepay,
              formatted: formatManWon(result.loanAnnualRepay),
            },
            {
              label: '기타부채 연간 이자',
              value: result.otherDebtAnnualInterest,
              formatted: formatManWon(result.otherDebtAnnualInterest),
            },
            {
              label: '월 상환금액',
              value: result.monthlyRepay,
              formatted: formatManWon(result.monthlyRepay),
            },
          ],
        },
        {
          title: 'DTI vs DSR 비교',
          results: [
            {
              label: 'DTI 특징',
              value: 0,
              formatted: '기타부채는 이자만 포함 (원금 제외)',
            },
            {
              label: 'DSR 특징',
              value: 0,
              formatted: '기타부채 원리금 전체 포함 + 스트레스금리 적용',
            },
            {
              label: '현재 DTI',
              value: result.dtiRate,
              formatted: `${formatPercent(result.dtiRate)}`,
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '연소득',
              value: annualIncome,
              formatted: formatManWon(annualIncome),
            },
            {
              label: '대출금액',
              value: loanAmount,
              formatted: formatManWon(loanAmount),
            },
            {
              label: '대출기간',
              value: loanTermMonths,
              formatted: `${loanTermMonths}개월`,
            },
            {
              label: '대출이율',
              value: loanRate,
              formatted: formatPercent(loanRate),
            },
            {
              label: '상환방식',
              value: 0,
              formatted: repaymentMethod,
            },
            {
              label: '기타부채금액',
              value: otherDebtAmount,
              formatted: formatManWon(otherDebtAmount),
            },
            {
              label: '기타부채이율',
              value: otherDebtRate,
              formatted: formatPercent(otherDebtRate),
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
      <h1 className="text-2xl font-bold text-foreground">DTI 계산기</h1>

      <CalculatorCard
        title="DTI (Debt to Income) 계산"
        description="총부채상환비율(DTI)을 계산합니다. DTI는 연소득 대비 연간 부채 상환액 비율입니다. (기타부채는 이자만 포함)"
      >
        <div className="space-y-4">
          <NumberInput
            label="연소득"
            value={annualIncome}
            onChange={setAnnualIncome}
            suffix="만원"
            placeholder="5,000"
            helpText="세전 연간 소득을 입력하세요"
          />

          <NumberInput
            label="대출금액"
            value={loanAmount}
            onChange={setLoanAmount}
            suffix="만원"
            placeholder="30,000"
          />

          <NumberInput
            label="대출기간"
            value={loanTermMonths}
            onChange={setLoanTermMonths}
            suffix="개월"
            placeholder="360"
            helpText="360개월 = 30년"
          />

          <NumberInput
            label="대출이율"
            value={loanRate}
            onChange={setLoanRate}
            suffix="%"
            placeholder="4.0"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">상환방식</Label>
            <Select
              value={repaymentMethod}
              onValueChange={(v) =>
                setRepaymentMethod(v as '원리금균등' | '원금균등' | '만기일시')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="원리금균등">원리금균등</SelectItem>
                <SelectItem value="원금균등">원금균등</SelectItem>
                <SelectItem value="만기일시">만기일시</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="기타부채금액"
            value={otherDebtAmount}
            onChange={setOtherDebtAmount}
            suffix="만원"
            placeholder="0"
            helpText="신용대출, 카드론 등 기타 부채 (이자만 계산)"
          />

          <NumberInput
            label="기타부채이율"
            value={otherDebtRate}
            onChange={setOtherDebtRate}
            suffix="%"
            placeholder="0"
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
      <InfoSection slug="dti" />
      <Disclaimer />
    </div>
  )
}
