'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { calculateAuctionDistribution } from '@/lib/calculators/auction-distribution'
import { formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function AuctionDistributionPage() {
  const [salePrice, setSalePrice] = useState(0)
  const [auctionCost, setAuctionCost] = useState(1000000)
  const [seniorClaim, setSeniorClaim] = useState(0)
  const [tenantDeposit, setTenantDeposit] = useState(0)
  const [juniorClaim, setJuniorClaim] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateAuctionDistribution({
        salePrice,
        auctionCost,
        seniorClaim,
        tenantDeposit,
        juniorClaim,
      })

      const distributionSections = result.distributions.map((dist) => ({
        title: dist.name,
        results: [
          {
            label: '청구액',
            value: dist.claim,
            formatted: formatManWon(dist.claim),
          },
          {
            label: '배당액',
            value: dist.distributed,
            formatted: formatManWon(dist.distributed),
          },
          {
            label: '배당 여부',
            value: dist.satisfied ? 1 : 0,
            formatted: dist.satisfied ? '전액 배당' : '일부 배당',
          },
          ...(dist.shortfall > 0
            ? [
                {
                  label: '부족액',
                  value: dist.shortfall,
                  formatted: formatManWon(dist.shortfall),
                },
              ]
            : []),
        ],
      }))

      setSections([
        {
          title: '배당 총액',
          results: [
            {
              label: '매각대금',
              value: result.totalSalePrice,
              formatted: formatManWon(result.totalSalePrice),
            },
            {
              label: '총 배당액',
              value: result.totalDistributed,
              formatted: formatManWon(result.totalDistributed),
            },
          ],
        },
        ...distributionSections,
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">경매배당 계산기</h1>

      <CalculatorCard
        title="경매 배당금 계산"
        description="경매 매각대금의 우선순위별 배당액을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매각대금"
            value={salePrice}
            onChange={setSalePrice}
            suffix="원"
            placeholder="200,000,000"
            helpText="실제 낙찰가격"
          />

          <NumberInput
            label="경매비용"
            value={auctionCost}
            onChange={setAuctionCost}
            suffix="원"
            placeholder="1,000,000"
            helpText="집행비용 등 (1순위)"
          />

          <NumberInput
            label="선순위채권액"
            value={seniorClaim}
            onChange={setSeniorClaim}
            suffix="원"
            placeholder="100,000,000"
            helpText="근저당권 등 (2순위)"
          />

          <NumberInput
            label="임차보증금"
            value={tenantDeposit}
            onChange={setTenantDeposit}
            suffix="원"
            placeholder="50,000,000"
            helpText="소액임차인 보증금 (3순위)"
          />

          <NumberInput
            label="후순위채권액"
            value={juniorClaim}
            onChange={setJuniorClaim}
            suffix="원"
            placeholder="30,000,000"
            helpText="후순위 근저당권 등 (4순위)"
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

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          경매 배당 순위
        </h3>
        <div className="space-y-1 text-xs text-blue-800">
          <p>1순위: 경매비용 (집행비용, 등기비용 등)</p>
          <p>2순위: 선순위채권 (근저당권, 가압류 등)</p>
          <p>3순위: 임차보증금 (소액임차인 보증금 포함)</p>
          <p>4순위: 후순위채권 (후순위 근저당권 등)</p>
          <p>5순위: 소유자 잔여금</p>
          <p className="mt-2">
            ※ 소액임차인의 경우 최우선변제권이 적용될 수 있으며, 실제 배당은
            등기부등본, 배당요구 현황 등에 따라 달라질 수 있습니다.
          </p>
        </div>
      </div>

      <InfoSection slug="auction-distribution" />
      <Disclaimer />
    </div>
  )
}
