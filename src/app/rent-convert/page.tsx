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
  convertJeonseToMonthly,
  convertMonthlyToJeonse,
} from '@/lib/calculators/rent-convert'
import { formatKRW, formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RentConvertPage() {
  const [tab, setTab] = useState<'to-monthly' | 'to-jeonse'>('to-monthly')

  const [jeonseDeposit, setJeonseDeposit] = useState(0)
  const [monthlyDeposit, setMonthlyDeposit] = useState(0)
  const [monthlyRent, setMonthlyRent] = useState(0)
  const [conversionRate, setConversionRate] = useState(4.5)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleToMonthly = () => {
    setError(null)
    try {
      const result = convertJeonseToMonthly({
        jeonseDeposit,
        monthlyDeposit,
        conversionRate,
      })
      setSections([
        {
          title: '전세 → 월세 변환 결과',
          results: [
            {
              label: '환산 월세',
              value: result.monthlyRent ?? 0,
              formatted: formatManWon(result.monthlyRent ?? 0),
            },
            {
              label: '전세보증금',
              value: jeonseDeposit,
              formatted: formatManWon(jeonseDeposit),
            },
            {
              label: '월세보증금',
              value: monthlyDeposit,
              formatted: formatManWon(monthlyDeposit),
            },
            {
              label: '전환율',
              value: conversionRate,
              formatted: formatPercent(conversionRate),
            },
          ],
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  const handleToJeonse = () => {
    setError(null)
    try {
      const result = convertMonthlyToJeonse({
        monthlyDeposit,
        monthlyRent,
        conversionRate,
      })
      setSections([
        {
          title: '월세 → 전세 변환 결과',
          results: [
            {
              label: '환산 전세금',
              value: result.jeonseEquivalent ?? 0,
              formatted: formatManWon(result.jeonseEquivalent ?? 0),
            },
            {
              label: '월세보증금',
              value: monthlyDeposit,
              formatted: formatManWon(monthlyDeposit),
            },
            {
              label: '월세',
              value: monthlyRent,
              formatted: formatKRW(monthlyRent),
            },
            {
              label: '전환율',
              value: conversionRate,
              formatted: formatPercent(conversionRate),
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
      <h1 className="text-2xl font-bold text-foreground">월세/전세 변환</h1>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as 'to-monthly' | 'to-jeonse')
          setJeonseDeposit(0)
          setMonthlyDeposit(0)
          setMonthlyRent(0)
          setConversionRate(4.5)
          setSections([])
          setError(null)
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="to-monthly">전세 → 월세</TabsTrigger>
          <TabsTrigger value="to-jeonse">월세 → 전세</TabsTrigger>
        </TabsList>

        <TabsContent value="to-monthly">
          <CalculatorCard
            title="전세 → 월세 변환"
            description="전세보증금을 월세로 변환합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="전세보증금"
                value={jeonseDeposit}
                onChange={setJeonseDeposit}
                suffix="원"
                placeholder="300,000,000"
              />
              <NumberInput
                label="월세보증금"
                value={monthlyDeposit}
                onChange={setMonthlyDeposit}
                suffix="원"
                placeholder="10,000,000"
              />
              <NumberInput
                label="전환율"
                value={conversionRate}
                onChange={setConversionRate}
                suffix="%"
                placeholder="4.5"
                helpText="보통 2.5~5.5% 범위"
              />
              <Button onClick={handleToMonthly} className="w-full">
                계산하기
              </Button>
            </div>
          </CalculatorCard>
        </TabsContent>

        <TabsContent value="to-jeonse">
          <CalculatorCard
            title="월세 → 전세 변환"
            description="월세를 전세보증금으로 변환합니다."
          >
            <div className="space-y-4">
              <NumberInput
                label="월세보증금"
                value={monthlyDeposit}
                onChange={setMonthlyDeposit}
                suffix="원"
                placeholder="10,000,000"
              />
              <NumberInput
                label="월세"
                value={monthlyRent}
                onChange={setMonthlyRent}
                suffix="원"
                placeholder="1,000,000"
              />
              <NumberInput
                label="전환율"
                value={conversionRate}
                onChange={setConversionRate}
                suffix="%"
                placeholder="4.5"
                helpText="보통 2.5~5.5% 범위"
              />
              <Button onClick={handleToJeonse} className="w-full">
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
      <InfoSection slug="rent-convert" />
      <Disclaimer />
    </div>
  )
}
