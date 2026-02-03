'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  adjustDepositToRent,
  adjustRentToDeposit,
} from '@/lib/calculators/rent-adjust'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RentAdjustPage() {
  const [tab, setTab] = useState<'deposit-up' | 'rent-up'>('deposit-up')

  const [currentDeposit, setCurrentDeposit] = useState(0)
  const [currentRent, setCurrentRent] = useState(0)
  const [newDeposit, setNewDeposit] = useState(0)
  const [newRent, setNewRent] = useState(0)
  const [conversionRate, setConversionRate] = useState(4.5)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleDepositUp = () => {
    setError(null)
    try {
      const result = adjustDepositToRent({
        currentDeposit,
        currentRent,
        newDeposit,
        conversionRate,
      })

      setSections([
        {
          title: '보증금 올리고 월세 줄이기',
          results: [
            {
              label: '변경 후 보증금',
              value: result.newDeposit,
              formatted: formatManWon(result.newDeposit),
            },
            {
              label: '변경 후 월세',
              value: result.newRent,
              formatted: formatKRW(result.newRent),
            },
            {
              label: '보증금 차이',
              value: result.depositDiff,
              formatted: formatManWon(result.depositDiff),
            },
            {
              label: '월세 차이',
              value: result.rentDiff,
              formatted: formatKRW(result.rentDiff),
              description: result.rentDiff < 0 ? '월세 감소' : '월세 증가',
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  const handleRentUp = () => {
    setError(null)
    try {
      const result = adjustRentToDeposit({
        currentDeposit,
        currentRent,
        newRent,
        conversionRate,
      })

      setSections([
        {
          title: '월세 올리고 보증금 줄이기',
          results: [
            {
              label: '변경 후 보증금',
              value: result.newDeposit,
              formatted: formatManWon(result.newDeposit),
            },
            {
              label: '변경 후 월세',
              value: result.newRent,
              formatted: formatKRW(result.newRent),
            },
            {
              label: '보증금 차이',
              value: result.depositDiff,
              formatted: formatManWon(result.depositDiff),
              description: result.depositDiff < 0 ? '보증금 감소' : '보증금 증가',
            },
            {
              label: '월세 차이',
              value: result.rentDiff,
              formatted: formatKRW(result.rentDiff),
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
      <h1 className="text-2xl font-bold text-foreground">
        월세보증금 조정 계산기
      </h1>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'deposit-up' | 'rent-up')
          setCurrentDeposit(0)
          setCurrentRent(0)
          setNewDeposit(0)
          setNewRent(0)
          setConversionRate(4.5)
          setSections([])
          setError(null)
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit-up">보증금 올리고 월세 줄이기</TabsTrigger>
          <TabsTrigger value="rent-up">월세 올리고 보증금 줄이기</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit-up">
          <CalculatorCard
            title="보증금 올리고 월세 줄이기"
            description="보증금을 올려서 월세를 줄일 수 있는 금액을 계산합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="현재 보증금"
                value={currentDeposit}
                onChange={setCurrentDeposit}
                suffix="원"
                placeholder="10,000,000"
              />
              <NumberInput
                label="현재 월세"
                value={currentRent}
                onChange={setCurrentRent}
                suffix="원"
                placeholder="500,000"
              />
              <NumberInput
                label="변경 보증금"
                value={newDeposit}
                onChange={setNewDeposit}
                suffix="원"
                placeholder="20,000,000"
              />
              <NumberInput
                label="전환율"
                value={conversionRate}
                onChange={setConversionRate}
                suffix="%"
                placeholder="4.5"
                helpText="기준 전환율 (2.5~5.5%)"
              />
              <Button onClick={handleDepositUp} className="w-full">
                계산하기
              </Button>
            </div>
          </CalculatorCard>
        </TabsContent>

        <TabsContent value="rent-up">
          <CalculatorCard
            title="월세 올리고 보증금 줄이기"
            description="월세를 올려서 보증금을 줄일 수 있는 금액을 계산합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="현재 보증금"
                value={currentDeposit}
                onChange={setCurrentDeposit}
                suffix="원"
                placeholder="20,000,000"
              />
              <NumberInput
                label="현재 월세"
                value={currentRent}
                onChange={setCurrentRent}
                suffix="원"
                placeholder="400,000"
              />
              <NumberInput
                label="변경 월세"
                value={newRent}
                onChange={setNewRent}
                suffix="원"
                placeholder="500,000"
              />
              <NumberInput
                label="전환율"
                value={conversionRate}
                onChange={setConversionRate}
                suffix="%"
                placeholder="4.5"
                helpText="기준 전환율 (2.5~5.5%)"
              />
              <Button onClick={handleRentUp} className="w-full">
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
      <InfoSection slug="rent-adjust" />
      <Disclaimer />
    </div>
  )
}
