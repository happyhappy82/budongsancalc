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
  calculateGiftTax,
  type DonorRelation,
} from '@/lib/calculators/gift-tax'
import { formatManWon } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function GiftTaxPage() {
  const [giftValue, setGiftValue] = useState(0)
  const [donorRelation, setDonorRelation] = useState<DonorRelation>('spouse')
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateGiftTax({
        giftValue,
        donorRelation,
      })

      const relationNames: Record<DonorRelation, string> = {
        spouse: '배우자',
        'direct-ascendant': '직계존속',
        'direct-descendant': '직계비속',
        relative: '기타친족',
        other: '기타',
      }

      const resultSections: CalculatorSection[] = [
        {
          title: '증여세 합계',
          results: [
            {
              label: '최종 납부세액',
              value: result.finalTax,
              formatted: formatManWon(result.finalTax),
            },
          ],
        },
        {
          title: '세부 내역',
          results: [
            {
              label: '증여재산가액',
              value: result.giftValue,
              formatted: formatManWon(result.giftValue),
            },
            {
              label: '면제한도',
              value: result.exemptionLimit,
              formatted: formatManWon(result.exemptionLimit),
              description: `${relationNames[donorRelation]} 기준`,
            },
            {
              label: '과세표준',
              value: result.taxableIncome,
              formatted: formatManWon(result.taxableIncome),
            },
            {
              label: '산출세액',
              value: result.calculatedTax,
              formatted: formatManWon(result.calculatedTax),
            },
            {
              label: '신고세액공제',
              value: result.reportingDiscount,
              formatted: `-${formatManWon(result.reportingDiscount)}`,
              description: '산출세액의 3%',
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
      <h1 className="text-2xl font-bold text-foreground">증여세 계산기</h1>

      <CalculatorCard
        title="증여세 계산"
        description="증여받은 재산에 대한 증여세를 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="증여재산가액"
            value={giftValue}
            onChange={setGiftValue}
            suffix="원"
            placeholder="100,000,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">증여자 관계</Label>
            <Select
              value={donorRelation}
              onValueChange={(v) => setDonorRelation(v as DonorRelation)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spouse">배우자 (6억)</SelectItem>
                <SelectItem value="direct-ascendant">
                  직계존속 (5천만원)
                </SelectItem>
                <SelectItem value="direct-descendant">
                  직계비속 (5천만원)
                </SelectItem>
                <SelectItem value="relative">기타친족 (1천만원)</SelectItem>
                <SelectItem value="other">기타 (면제없음)</SelectItem>
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
      <InfoSection slug="gift-tax" />
      <Disclaimer />
    </div>
  )
}
