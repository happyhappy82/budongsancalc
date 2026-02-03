'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateRentalYield } from '@/lib/calculators/rental-yield'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RentalYieldPage() {
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [otherCosts, setOtherCosts] = useState(0)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanRate, setLoanRate] = useState(0)
  const [deposit, setDeposit] = useState(0)
  const [monthlyRent, setMonthlyRent] = useState(0)
  const [annualExpenses, setAnnualExpenses] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRentalYield({
        purchasePrice,
        otherCosts,
        loanAmount,
        loanRate,
        deposit,
        monthlyRent,
        annualExpenses,
      })

      const resultSections: CalculatorSection[] = [
        {
          title: '수익률 분석',
          results: [
            {
              label: '총수익률 (Gross Yield)',
              value: result.grossYield,
              formatted: formatPercent(result.grossYield),
              description: '연간임대수입 / 총투자금',
            },
            {
              label: '순수익률 (ROI)',
              value: result.roi,
              formatted: formatPercent(result.roi),
              description: '순수익 / 자기자본',
            },
            {
              label: '캡레이트 (Cap Rate)',
              value: result.capRate,
              formatted: formatPercent(result.capRate),
              description: 'NOI / 총투자금',
            },
          ],
        },
        {
          title: '투자 구조',
          results: [
            {
              label: '총투자금',
              value: result.totalInvestment,
              formatted: formatManWon(result.totalInvestment),
            },
            {
              label: '자기자본',
              value: result.equity,
              formatted: formatManWon(result.equity),
              description: '총투자금 - 대출금 - 보증금',
            },
          ],
        },
        {
          title: '수익 구조',
          results: [
            {
              label: '연간임대수입',
              value: result.annualRentalIncome,
              formatted: formatManWon(result.annualRentalIncome),
            },
            {
              label: '연간대출이자',
              value: result.annualLoanInterest,
              formatted: formatManWon(result.annualLoanInterest),
            },
            {
              label: '연간운영비용',
              value: annualExpenses,
              formatted: formatManWon(annualExpenses),
            },
            {
              label: '순수익',
              value: result.netIncome,
              formatted: formatManWon(result.netIncome),
              description: '임대수입 - 대출이자 - 운영비용',
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
      <h1 className="text-2xl font-bold text-foreground">임대수익률 계산기</h1>

      <CalculatorCard
        title="임대수익률 계산"
        description="부동산 임대투자의 총수익률, 순수익률(ROI), 캡레이트를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매매가"
            value={purchasePrice}
            onChange={setPurchasePrice}
            suffix="원"
            placeholder="500,000,000"
          />

          <NumberInput
            label="기타비용"
            value={otherCosts}
            onChange={setOtherCosts}
            suffix="원"
            placeholder="20,000,000"
            helpText="취득세, 중개수수료 등"
          />

          <NumberInput
            label="대출금"
            value={loanAmount}
            onChange={setLoanAmount}
            suffix="원"
            placeholder="300,000,000"
          />

          <NumberInput
            label="대출이율"
            value={loanRate}
            onChange={setLoanRate}
            suffix="%"
            placeholder="4.5"
          />

          <NumberInput
            label="보증금"
            value={deposit}
            onChange={setDeposit}
            suffix="원"
            placeholder="50,000,000"
          />

          <NumberInput
            label="월세"
            value={monthlyRent}
            onChange={setMonthlyRent}
            suffix="원/월"
            placeholder="2,000,000"
          />

          <NumberInput
            label="연간운영비용"
            value={annualExpenses}
            onChange={setAnnualExpenses}
            suffix="원/년"
            placeholder="5,000,000"
            helpText="관리비, 수선비, 보험료 등"
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
      <InfoSection slug="rental-yield" />
      <Disclaimer />
    </div>
  )
}
