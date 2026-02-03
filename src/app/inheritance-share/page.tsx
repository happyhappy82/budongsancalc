'use client'

import { useState } from 'react'
import { CalculatorCard } from '@/components/calculator/calculator-card'
import { NumberInput } from '@/components/calculator/number-input'
import { ResultDisplay } from '@/components/calculator/result-display'
import { Disclaimer } from '@/components/calculator/disclaimer'
import { InfoSection } from '@/components/calculator/info-section'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { calculateInheritanceShare } from '@/lib/calculators/inheritance-share'
import { formatManWon, formatPercent } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function InheritanceSharePage() {
  const [totalAssets, setTotalAssets] = useState(0)
  const [hasSpouse, setHasSpouse] = useState(false)
  const [numberOfChildren, setNumberOfChildren] = useState(0)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateInheritanceShare({
        totalAssets,
        hasSpouse,
        numberOfChildren,
      })

      setSections([
        {
          title: '상속지분 계산 결과',
          results: result.shares.map((share) => ({
            label: share.heir,
            value: share.amount,
            formatted: formatManWon(share.amount),
            description: `지분율: ${formatPercent(share.shareRatio)}`,
          })),
        },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : '계산 중 오류가 발생했습니다.')
      setSections([])
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">상속지분 계산기</h1>

      <CalculatorCard
        title="상속지분 계산"
        description="민법상 법정상속분에 따른 각 상속인의 지분을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="상속재산가액"
            value={totalAssets}
            onChange={setTotalAssets}
            suffix="원"
            placeholder="500,000,000"
          />

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpouse}
                onChange={(e) => setHasSpouse(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label className="text-sm font-medium cursor-pointer">배우자 있음</Label>
            </label>
            <p className="text-xs text-muted-foreground">
              배우자는 자녀의 1.5배 상속
            </p>
          </div>

          <NumberInput
            label="자녀수"
            value={numberOfChildren}
            onChange={setNumberOfChildren}
            suffix="명"
            placeholder="2"
            helpText="직계비속(자녀) 수"
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
      <InfoSection slug="inheritance-share" />
      <Disclaimer />
    </div>
  )
}
