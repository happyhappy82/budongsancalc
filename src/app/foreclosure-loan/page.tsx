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
import { calculateForeclosureLoan } from '@/lib/calculators/foreclosure-loan'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function ForeclosureLoanPage() {
  const [salePrice, setSalePrice] = useState(0)
  const [appraisalPrice, setAppraisalPrice] = useState(0)
  const [borrowerType, setBorrowerType] = useState<
    '무주택자' | '1주택자' | '다주택자'
  >('무주택자')
  const [region, setRegion] = useState<'수도권' | '비수도권'>('수도권')
  const [financialTier, setFinancialTier] = useState<'1금융권' | '2금융권'>(
    '1금융권'
  )
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateForeclosureLoan({
        salePrice,
        appraisalPrice,
        borrowerType,
        region,
        financialTier,
      })

      setSections([
        {
          title: '경락대출 계산 결과',
          results: [
            {
              label: '적용 LTV 비율',
              value: result.ltvRate,
              formatted: formatPercent(result.ltvRate),
            },
            {
              label: '담보인정기준가',
              value: result.collateralBase,
              formatted: formatManWon(result.collateralBase),
              description: '낙찰가와 감정가 중 낮은 금액',
            },
            {
              label: '최대 대출가능금액',
              value: result.maxLoanAmount,
              formatted: formatManWon(result.maxLoanAmount),
            },
            {
              label: '필요 자기자본',
              value: result.requiredEquity,
              formatted: formatManWon(result.requiredEquity),
              description: '낙찰가 - 최대대출금액',
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '낙찰가',
              value: salePrice,
              formatted: formatManWon(salePrice),
            },
            {
              label: '감정가',
              value: appraisalPrice,
              formatted: formatManWon(appraisalPrice),
            },
            {
              label: '차주유형',
              value: 0,
              formatted: borrowerType,
            },
            {
              label: '지역',
              value: 0,
              formatted: region,
            },
            {
              label: '금융권',
              value: 0,
              formatted: financialTier,
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
      <h1 className="text-2xl font-bold text-foreground">경락대출한도 계산기</h1>

      <CalculatorCard
        title="경락대출한도 계산"
        description="경매 낙찰 후 받을 수 있는 최대 대출금액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="낙찰가"
            value={salePrice}
            onChange={setSalePrice}
            suffix="만원"
            placeholder="30,000"
          />

          <NumberInput
            label="감정가"
            value={appraisalPrice}
            onChange={setAppraisalPrice}
            suffix="만원"
            placeholder="40,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">차주유형</Label>
            <Select
              value={borrowerType}
              onValueChange={(v) =>
                setBorrowerType(v as '무주택자' | '1주택자' | '다주택자')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="무주택자">무주택자</SelectItem>
                <SelectItem value="1주택자">1주택자</SelectItem>
                <SelectItem value="다주택자">다주택자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">지역</Label>
            <Select
              value={region}
              onValueChange={(v) => setRegion(v as '수도권' | '비수도권')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="수도권">수도권</SelectItem>
                <SelectItem value="비수도권">비수도권</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">금융권</Label>
            <Select
              value={financialTier}
              onValueChange={(v) => setFinancialTier(v as '1금융권' | '2금융권')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1금융권">1금융권 (은행)</SelectItem>
                <SelectItem value="2금융권">2금융권 (저축은행 등)</SelectItem>
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
      <InfoSection slug="foreclosure-loan" />
      <Disclaimer />
    </div>
  )
}
