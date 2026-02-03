'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { calculateLoanRepayment, calculateMaxLoan } from '@/lib/calculators/loan'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'
import type { RepaymentMethod } from '@/lib/types/calculator'

export default function LoanPage() {
  const [tab, setTab] = useState<'repayment' | 'max-loan'>('repayment')

  const [loanAmount, setLoanAmount] = useState(0)
  const [annualRate, setAnnualRate] = useState(0)
  const [loanTermYears, setLoanTermYears] = useState(30)
  const [repaymentMethod, setRepaymentMethod] =
    useState<RepaymentMethod>('equal-principal-interest')

  const [propertyValue, setPropertyValue] = useState(0)
  const [annualIncome, setAnnualIncome] = useState(0)
  const [otherDebtPayment, setOtherDebtPayment] = useState(0)
  const [region, setRegion] = useState<'capital' | 'non-capital'>('capital')
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [financialInstitution, setFinancialInstitution] =
    useState<'first' | 'second'>('first')

  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleRepayment = () => {
    setError(null)
    try {
      const result = calculateLoanRepayment({
        loanAmount,
        annualRate,
        loanTermYears,
        repaymentMethod,
      })

      setSections([
        {
          title: '상환 요약',
          results: [
            {
              label: repaymentMethod === 'equal-principal' ? '첫 달 상환금' : '월 상환금',
              value: result.monthlyPayment,
              formatted: formatManWon(result.monthlyPayment),
            },
            {
              label: '총 상환금',
              value: result.totalPayment,
              formatted: formatManWon(result.totalPayment),
            },
            {
              label: '총 이자',
              value: result.totalInterest,
              formatted: formatManWon(result.totalInterest),
            },
            {
              label: '대출원금',
              value: loanAmount,
              formatted: formatManWon(loanAmount),
            },
          ],
        },
        {
          title: '상환 조건',
          results: [
            {
              label: '금리',
              value: annualRate,
              formatted: formatPercent(annualRate),
            },
            {
              label: '대출기간',
              value: loanTermYears,
              formatted: `${loanTermYears}년 (${loanTermYears * 12}개월)`,
            },
            {
              label: '상환방식',
              value: 0,
              formatted:
                repaymentMethod === 'equal-principal-interest'
                  ? '원리금균등상환'
                  : repaymentMethod === 'equal-principal'
                    ? '원금균등상환'
                    : '만기일시상환',
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  const handleMaxLoan = () => {
    setError(null)
    try {
      const result = calculateMaxLoan(
        {
          propertyValue,
          annualIncome,
          otherDebtPayment,
          region,
          isFirstTimeBuyer,
          financialInstitution,
        },
        loanTermYears,
        annualRate
      )

      setSections([
        {
          title: '최대 대출 가능액',
          results: [
            {
              label: '최대 대출 가능액',
              value: result.maxLoan,
              formatted: formatManWon(result.maxLoan),
              description: 'LTV와 DSR 한도 중 적은 금액',
            },
          ],
        },
        {
          title: 'LTV (담보인정비율)',
          results: [
            {
              label: 'LTV 한도',
              value: result.ltvLimit,
              formatted: formatPercent(result.ltvLimit),
            },
            {
              label: 'LTV 기준 최대 대출',
              value: result.maxLoanByLtv,
              formatted: formatManWon(result.maxLoanByLtv),
            },
          ],
        },
        {
          title: 'DSR (총부채원리금상환비율)',
          results: [
            {
              label: 'DSR 한도',
              value: result.dsrLimit,
              formatted: formatPercent(result.dsrLimit),
            },
            {
              label: 'DSR 기준 최대 대출',
              value: result.maxLoanByDsr,
              formatted: formatManWon(result.maxLoanByDsr),
              description: '스트레스 DSR 적용',
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
      <h1 className="text-2xl font-bold text-foreground">대출/상환 계산기</h1>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'repayment' | 'max-loan')
          setLoanAmount(0)
          setAnnualRate(0)
          setLoanTermYears(30)
          setRepaymentMethod('equal-principal-interest')
          setPropertyValue(0)
          setAnnualIncome(0)
          setOtherDebtPayment(0)
          setRegion('capital')
          setIsFirstTimeBuyer(false)
          setFinancialInstitution('first')
          setSections([])
          setError(null)
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="repayment">상환 계산</TabsTrigger>
          <TabsTrigger value="max-loan">최대 대출 가능액</TabsTrigger>
        </TabsList>

        <TabsContent value="repayment">
          <CalculatorCard
            title="대출 상환 계산"
            description="대출 상환 스케줄을 계산합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="대출금액"
                value={loanAmount}
                onChange={setLoanAmount}
                suffix="원"
                placeholder="300,000,000"
              />
              <NumberInput
                label="연이율"
                value={annualRate}
                onChange={setAnnualRate}
                suffix="%"
                placeholder="4.0"
              />
              <NumberInput
                label="대출기간"
                value={loanTermYears}
                onChange={setLoanTermYears}
                suffix="년"
                max={50}
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">상환방식</Label>
                <Select
                  value={repaymentMethod}
                  onValueChange={(v) =>
                    setRepaymentMethod(v as RepaymentMethod)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal-principal-interest">
                      원리금균등상환
                    </SelectItem>
                    <SelectItem value="equal-principal">
                      원금균등상환
                    </SelectItem>
                    <SelectItem value="bullet">만기일시상환</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRepayment} className="w-full">
                계산하기
              </Button>
            </div>
          </CalculatorCard>
        </TabsContent>

        <TabsContent value="max-loan">
          <CalculatorCard
            title="최대 대출 가능액"
            description="LTV와 DSR을 기반으로 최대 대출 가능액을 산정합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="담보 부동산 가격"
                value={propertyValue}
                onChange={setPropertyValue}
                suffix="원"
                placeholder="1,000,000,000"
              />
              <NumberInput
                label="연소득"
                value={annualIncome}
                onChange={setAnnualIncome}
                suffix="원"
                placeholder="80,000,000"
              />
              <NumberInput
                label="기존 대출 연 상환액"
                value={otherDebtPayment}
                onChange={setOtherDebtPayment}
                suffix="원"
                placeholder="0"
              />
              <NumberInput
                label="연이율"
                value={annualRate}
                onChange={setAnnualRate}
                suffix="%"
                placeholder="4.0"
              />
              <NumberInput
                label="대출기간"
                value={loanTermYears}
                onChange={setLoanTermYears}
                suffix="년"
                max={50}
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">지역</Label>
                <Select
                  value={region}
                  onValueChange={(v) =>
                    setRegion(v as 'capital' | 'non-capital')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="capital">수도권</SelectItem>
                    <SelectItem value="non-capital">비수도권</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">금융기관</Label>
                <Select
                  value={financialInstitution}
                  onValueChange={(v) =>
                    setFinancialInstitution(v as 'first' | 'second')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">제1금융권 (은행)</SelectItem>
                    <SelectItem value="second">제2금융권</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFirstTimeBuyer}
                  onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">생애최초 주택 구입</span>
              </label>

              <Button onClick={handleMaxLoan} className="w-full">
                계산하기
              </Button>
            </div>
          </CalculatorCard>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <ResultDisplay sections={sections} />
      <InfoSection slug="loan" />
      <Disclaimer />
    </div>
  )
}
