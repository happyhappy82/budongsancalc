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
import {
  calculateBrokerage,
  type ContractType,
  type PropertyType,
} from '@/lib/calculators/brokerage'
import { formatManWon, formatPercent, formatKRW } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function BrokeragePage() {
  const [contractType, setContractType] = useState<ContractType>('매매')
  const [propertyType, setPropertyType] = useState<PropertyType>('주택')
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [monthlyRent, setMonthlyRent] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateBrokerage({
        contractType,
        propertyType,
        transactionAmount,
        monthlyRent: contractType === '월세' ? monthlyRent : undefined,
      })

      const contractTypeNames: Record<ContractType, string> = {
        매매: '매매',
        전세: '전세',
        월세: '월세',
      }

      const propertyTypeNames: Record<PropertyType, string> = {
        주택: '주택',
        오피스텔: '오피스텔',
        그외: '그외',
      }

      const resultSections: CalculatorSection[] = [
        {
          title: '총 중개보수',
          results: [
            {
              label: result.hasVAT ? '총 중개보수 (VAT 포함)' : '총 중개보수',
              value: result.totalWithVAT,
              formatted: formatManWon(result.totalWithVAT),
              description: `${contractTypeNames[contractType]} / ${propertyTypeNames[propertyType]}`,
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            ...(contractType === '월세'
              ? [
                  {
                    label: '보증금',
                    value: transactionAmount,
                    formatted: formatManWon(transactionAmount),
                  },
                  {
                    label: '월세',
                    value: monthlyRent,
                    formatted: formatManWon(monthlyRent),
                  },
                  {
                    label: '환산 거래금액',
                    value: result.effectiveAmount,
                    formatted: formatManWon(result.effectiveAmount),
                    description:
                      result.effectiveAmount >= 50_000_000
                        ? '보증금 + (월세 × 100)'
                        : '보증금 + (월세 × 70)',
                  },
                ]
              : [
                  {
                    label: '거래금액',
                    value: result.effectiveAmount,
                    formatted: formatManWon(result.effectiveAmount),
                  },
                ]),
            {
              label: '적용 요율',
              value: result.appliedRate,
              formatted: formatPercent(result.appliedRate),
            },
            {
              label: '중개보수',
              value: result.commission,
              formatted: formatKRW(result.commission),
            },
            ...(result.hasVAT
              ? [
                  {
                    label: '부가세 (VAT)',
                    value: result.vat,
                    formatted: formatKRW(result.vat),
                    description: '중개보수의 10%',
                  },
                ]
              : []),
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
      <h1 className="text-2xl font-bold text-foreground">중개보수 계산기</h1>

      <CalculatorCard
        title="중개보수 계산"
        description="부동산 거래 시 발생하는 중개보수를 계산합니다. (서울 기준)"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">거래 유형</Label>
            <Select
              value={contractType}
              onValueChange={(v) => setContractType(v as ContractType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="매매">매매</SelectItem>
                <SelectItem value="전세">전세</SelectItem>
                <SelectItem value="월세">월세</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">부동산 유형</Label>
            <Select
              value={propertyType}
              onValueChange={(v) => setPropertyType(v as PropertyType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="주택">주택</SelectItem>
                <SelectItem value="오피스텔">오피스텔 (VAT 포함)</SelectItem>
                <SelectItem value="그외">
                  그외 (상가/토지 등, VAT 포함)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contractType === '월세' ? (
            <>
              <NumberInput
                label="보증금"
                value={transactionAmount}
                onChange={setTransactionAmount}
                suffix="원"
                placeholder="50,000,000"
              />
              <NumberInput
                label="월세"
                value={monthlyRent}
                onChange={setMonthlyRent}
                suffix="원"
                placeholder="1,000,000"
                helpText="환산 거래금액: 보증금 + (월세 × 100) or (월세 × 70)"
              />
            </>
          ) : (
            <NumberInput
              label={contractType === '매매' ? '매매 금액' : '전세 금액'}
              value={transactionAmount}
              onChange={setTransactionAmount}
              suffix="원"
              placeholder="500,000,000"
            />
          )}

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
      <InfoSection slug="brokerage" />
      <Disclaimer />
    </div>
  )
}
