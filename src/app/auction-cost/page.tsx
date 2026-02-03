'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateAuctionCost } from '@/lib/calculators/auction-cost'
import { formatKRW, formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function AuctionCostPage() {
  const [bidPrice, setBidPrice] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAuctionCost({ bidPrice })

      const resultSections: CalculatorSection[] = [
        {
          title: '총 투자금액',
          results: [
            {
              label: '실투자금액',
              value: result.totalInvestment,
              formatted: formatManWon(result.totalInvestment),
              description: '매각대금 + 부대비용',
            },
            {
              label: '총 부대비용',
              value: result.totalIncidentalCost,
              formatted: formatManWon(result.totalIncidentalCost),
            },
          ],
        },
        {
          title: '부대비용 세부 내역',
          results: [
            {
              label: '취득세',
              value: result.acquisitionTax,
              formatted: formatKRW(result.acquisitionTax),
              description: '매각대금의 4.6%',
            },
            {
              label: '명도비용',
              value: result.evictionCost,
              formatted: formatKRW(result.evictionCost),
              description: '예상 비용',
            },
            {
              label: '이사비용',
              value: result.movingCost,
              formatted: formatKRW(result.movingCost),
              description: '예상 비용',
            },
            {
              label: '수리비',
              value: result.repairCost,
              formatted: formatKRW(result.repairCost),
              description: '매각대금의 3%',
            },
            {
              label: '법무사비용',
              value: result.lawyerFee,
              formatted: formatKRW(result.lawyerFee),
              description: '예상 비용',
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
      <h1 className="text-2xl font-bold text-foreground">경매비용 계산기</h1>

      <CalculatorCard
        title="경매 부대비용 계산"
        description="부동산 경매 낙찰 시 필요한 각종 부대비용과 실투자금액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매각대금"
            value={bidPrice}
            onChange={setBidPrice}
            suffix="원"
            placeholder="300,000,000"
            helpText="낙찰받은 금액을 입력하세요"
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
      <InfoSection slug="auction-cost" />
      <Disclaimer />
    </div>
  )
}
