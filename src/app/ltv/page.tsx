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
import { calculateLtv } from '@/lib/calculators/ltv'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function LtvPage() {
  const [propertyPrice, setPropertyPrice] = useState(0)
  const [borrowerType, setBorrowerType] = useState<
    '생애최초' | '무주택자' | '1주택자' | '다주택자'
  >('무주택자')
  const [region, setRegion] = useState<
    '투기지역' | '조정지역' | '수도권' | '비수도권'
  >('수도권')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateLtv({
        propertyPrice,
        borrowerType,
        region,
      })

      setSections([
        {
          title: 'LTV 계산 결과',
          results: [
            {
              label: '적용 LTV 비율',
              value: result.ltvRate,
              formatted: formatPercent(result.ltvRate),
            },
            {
              label: '최대 대출가능금액',
              value: result.maxLoanAmount,
              formatted: formatManWon(result.maxLoanAmount),
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '주택가격',
              value: propertyPrice,
              formatted: formatManWon(propertyPrice),
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
      <h1 className="text-2xl font-bold text-foreground">LTV 계산기</h1>

      <CalculatorCard
        title="LTV (Loan To Value) 계산"
        description="담보인정비율(LTV)에 따른 최대 대출가능금액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="주택가격"
            value={propertyPrice}
            onChange={setPropertyPrice}
            suffix="원"
            placeholder="500,000,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">차주유형</Label>
            <Select
              value={borrowerType}
              onValueChange={(v) =>
                setBorrowerType(
                  v as '생애최초' | '무주택자' | '1주택자' | '다주택자'
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="생애최초">생애최초</SelectItem>
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
              onValueChange={(v) =>
                setRegion(v as '투기지역' | '조정지역' | '수도권' | '비수도권')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="투기지역">투기지역</SelectItem>
                <SelectItem value="조정지역">조정지역</SelectItem>
                <SelectItem value="수도권">수도권</SelectItem>
                <SelectItem value="비수도권">비수도권</SelectItem>
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
      <InfoSection slug="ltv" />
      <Disclaimer />
    </div>
  )
}
