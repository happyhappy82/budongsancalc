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
import { calculateDsr } from '@/lib/calculators/dsr'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function DsrPage() {
  const [annualIncome, setAnnualIncome] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanTermMonths, setLoanTermMonths] = useState(360)
  const [loanRate, setLoanRate] = useState(4.0)
  const [repaymentMethod, setRepaymentMethod] = useState<
    '원리금균등' | '원금균등' | '만기일시'
  >('원리금균등')
  const [otherDebtAmount, setOtherDebtAmount] = useState(0)
  const [otherDebtRate, setOtherDebtRate] = useState(0)
  const [stressRate, setStressRate] = useState(1.5)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateDsr({
        annualIncome,
        loanAmount,
        loanTermMonths,
        loanRate,
        repaymentMethod,
        otherDebtAmount,
        otherDebtRate,
        stressRate,
      })

      setSections([
        {
          title: 'DSR 계산 결과',
          results: [
            {
              label: 'DSR 비율',
              value: result.dsrRate,
              formatted: formatPercent(result.dsrRate),
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
              label: '기타부채 연간 상환액',
              value: result.otherDebtAnnualRepay,
              formatted: formatManWon(result.otherDebtAnnualRepay),
            },
            {
              label: '월 상환금액',
              value: result.monthlyRepay,
              formatted: formatManWon(result.monthlyRepay),
            },
          ],
        },
        {
          title: 'DSR 규제 기준',
          results: [
            {
              label: '1금융권 기준',
              value: 40,
              formatted: '40% (시중은행, 저축은행)',
            },
            {
              label: '2금융권 기준',
              value: 50,
              formatted: '50% (카드사, 캐피탈)',
            },
            {
              label: '현재 DSR',
              value: result.dsrRate,
              formatted: `${formatPercent(result.dsrRate)} ${
                result.dsrRate <= 40
                  ? '(1금융권 대출 가능)'
                  : result.dsrRate <= 50
                    ? '(2금융권 대출 가능)'
                    : '(규제 초과)'
              }`,
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
            {
              label: '스트레스금리',
              value: stressRate,
              formatted: formatPercent(stressRate),
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
      <h1 className="text-2xl font-bold text-foreground">DSR 계산기</h1>

      <CalculatorCard
        title="DSR (Debt Service Ratio) 계산"
        description="총부채원리금상환비율(DSR)을 계산합니다. DSR은 연소득 대비 연간 총 부채 상환액 비율입니다."
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
            helpText="신용대출, 카드론 등 기타 부채"
          />

          <NumberInput
            label="기타부채이율"
            value={otherDebtRate}
            onChange={setOtherDebtRate}
            suffix="%"
            placeholder="0"
          />

          <NumberInput
            label="스트레스금리"
            value={stressRate}
            onChange={setStressRate}
            suffix="%"
            placeholder="1.5"
            helpText="금리 상승 위험을 반영한 가산금리 (통상 1.5%)"
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
      <InfoSection slug="dsr" />
      <Disclaimer />
    </div>
  )
}
