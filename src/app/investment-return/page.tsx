'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { Button } from '@/components/ui/button'
import { calculateInvestmentReturn } from '@/lib/calculators/investment-return'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function InvestmentReturnPage() {
  const [purchasePrice, setPurchasePrice] = useState(0)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [annualRentalIncome, setAnnualRentalIncome] = useState(0)
  const [annualExpenses, setAnnualExpenses] = useState(0)
  const [holdingYears, setHoldingYears] = useState(1)
  const [loanAmount, setLoanAmount] = useState(0)
  const [loanInterestRate, setLoanInterestRate] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateInvestmentReturn({
        purchasePrice,
        currentPrice,
        totalInvestment,
        annualRentalIncome,
        annualExpenses,
        holdingYears,
        loanAmount,
        loanInterestRate,
      })

      setSections([
        {
          title: '투자 수익률 요약',
          results: [
            {
              label: 'ROI (총 수익률)',
              value: result.roi,
              formatted: formatPercent(result.roi),
            },
            {
              label: '연환산 수익률',
              value: result.annualizedReturn,
              formatted: formatPercent(result.annualizedReturn),
              description: '단리 기준',
            },
            {
              label: '총 순수익',
              value: result.totalProfit,
              formatted: formatManWon(result.totalProfit),
            },
          ],
        },
        {
          title: '수익 분석',
          results: [
            {
              label: '시세차익',
              value: result.totalGain,
              formatted: formatManWon(result.totalGain),
              description: '현재시세 - 매입가',
            },
            {
              label: '순 임대수익 (연)',
              value: result.netRentalIncome,
              formatted: formatManWon(result.netRentalIncome),
              description: '임대수익 - 비용',
            },
            {
              label: '총 임대수익',
              value: result.totalRentalIncome,
              formatted: formatManWon(result.totalRentalIncome),
              description: `${holdingYears}년간 누적`,
            },
            {
              label: '총 대출이자',
              value: result.totalLoanInterest,
              formatted: `-${formatManWon(result.totalLoanInterest)}`,
              description: `연 ${formatManWon(result.annualLoanInterest)}`,
            },
          ],
        },
        {
          title: '투자 지표',
          results: [
            {
              label: '캡레이트 (Cap Rate)',
              value: result.capRate,
              formatted: formatPercent(result.capRate),
              description: '순임대수익 / 매입가',
            },
            {
              label: '레버리지 배율',
              value: result.leverageEffect,
              formatted: `${result.leverageEffect}배`,
              description: '매입가 / 자기자본',
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
      <h1 className="text-2xl font-bold text-foreground">투자 수익률 계산기</h1>

      <CalculatorCard
        title="부동산 투자 수익률"
        description="시세차익, 임대수익, 대출이자를 종합하여 투자 수익률을 분석합니다."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="매입가"
              value={purchasePrice}
              onChange={setPurchasePrice}
              suffix="원"
              placeholder="500,000,000"
            />
            <NumberInput
              label="현재 시세"
              value={currentPrice}
              onChange={setCurrentPrice}
              suffix="원"
              placeholder="600,000,000"
              helpText="또는 예상 매도가"
            />
          </div>

          <NumberInput
            label="총 투자금 (자기자본)"
            value={totalInvestment}
            onChange={setTotalInvestment}
            suffix="원"
            placeholder="200,000,000"
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="연 임대수익"
              value={annualRentalIncome}
              onChange={setAnnualRentalIncome}
              suffix="원"
              placeholder="24,000,000"
            />
            <NumberInput
              label="연 비용"
              value={annualExpenses}
              onChange={setAnnualExpenses}
              suffix="원"
              placeholder="4,000,000"
              helpText="관리비, 수선비, 세금 등"
            />
          </div>

          <NumberInput
            label="보유기간"
            value={holdingYears}
            onChange={setHoldingYears}
            suffix="년"
            max={100}
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="대출금"
              value={loanAmount}
              onChange={setLoanAmount}
              suffix="원"
              placeholder="300,000,000"
            />
            <NumberInput
              label="대출 금리"
              value={loanInterestRate}
              onChange={setLoanInterestRate}
              suffix="%"
              placeholder="4.0"
            />
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
      <Disclaimer />
    </div>
  )
}
