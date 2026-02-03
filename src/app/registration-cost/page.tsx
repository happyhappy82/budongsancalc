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
import { calculateRegistrationCost } from '@/lib/calculators/registration-cost'
import { formatManWon, formatKRW } from '@/lib/utils/format'
import type { CalculatorSection } from '@/lib/types/calculator'

export default function RegistrationCostPage() {
  const [propertyPrice, setPropertyPrice] = useState(0)
  const [propertyType, setPropertyType] = useState<
    '주택' | '오피스텔' | '기타건물' | '토지'
  >('주택')
  const [region, setRegion] = useState<
    '서울' | '수도권' | '광역시' | '기타지역'
  >('서울')
  const [area, setArea] = useState(85)
  const [housingCount, setHousingCount] = useState<
    '1주택' | '2주택' | '3주택이상'
  >('1주택')
  const [isSelfRegistration, setIsSelfRegistration] = useState(false)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [sections, setSections] = useState<readonly CalculatorSection[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    try {
      const result = calculateRegistrationCost({
        propertyPrice,
        propertyType,
        region,
        area,
        housingCount,
        isSelfRegistration,
        isFirstTimeBuyer,
      })

      setSections([
        {
          title: '세금',
          results: [
            {
              label: '취득세',
              value: result.acquisitionTax,
              formatted: formatKRW(result.acquisitionTax),
            },
            {
              label: '지방교육세',
              value: result.localEducationTax,
              formatted: formatKRW(result.localEducationTax),
              description:
                propertyType === '주택'
                  ? '취득세의 10%'
                  : '취득세의 20%',
            },
            {
              label: '농어촌특별세',
              value: result.ruralSpecialTax,
              formatted: formatKRW(result.ruralSpecialTax),
              description:
                result.ruralSpecialTax > 0
                  ? '6억 초과 주택, 매매가의 0.2%'
                  : '해당없음',
            },
            ...(result.firstTimeBuyerDiscount > 0
              ? [
                  {
                    label: '생애최초 감면',
                    value: -result.firstTimeBuyerDiscount,
                    formatted: `-${formatKRW(result.firstTimeBuyerDiscount)}`,
                    description: '최대 200만원',
                  },
                ]
              : []),
            {
              label: '세금 합계',
              value: result.totalTaxes,
              formatted: formatKRW(result.totalTaxes),
            },
          ],
        },
        {
          title: '국민주택채권',
          results: [
            {
              label: '채권매입액',
              value: result.housingBondPurchase,
              formatted: formatKRW(result.housingBondPurchase),
            },
            {
              label: '실부담금액 (할인 후)',
              value: result.housingBondActualCost,
              formatted: formatKRW(result.housingBondActualCost),
              description: '매입액의 6% (할인율 94%)',
            },
          ],
        },
        {
          title: '법무사 비용',
          results: [
            {
              label: '법무사 보수',
              value: result.attorneyFee,
              formatted: formatKRW(result.attorneyFee),
              description: isSelfRegistration
                ? '셀프등기 선택'
                : '등기대행 수수료',
            },
          ],
        },
        {
          title: '총 등기비용',
          results: [
            {
              label: '총 비용',
              value: result.totalCost,
              formatted: formatKRW(result.totalCost),
            },
          ],
        },
        {
          title: '입력 정보',
          results: [
            {
              label: '매매가',
              value: propertyPrice,
              formatted: formatManWon(propertyPrice),
            },
            {
              label: '부동산 유형',
              value: 0,
              formatted: propertyType,
            },
            {
              label: '지역',
              value: 0,
              formatted: region,
            },
            {
              label: '주택 수',
              value: 0,
              formatted: housingCount,
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
      <h1 className="text-2xl font-bold text-foreground">등기비용 계산기</h1>

      <CalculatorCard
        title="등기비용 계산"
        description="부동산 취득 시 필요한 취득세, 교육세, 채권매입비용, 법무사 비용을 계산합니다."
      >
        <div className="space-y-4">
          <NumberInput
            label="매매가"
            value={propertyPrice}
            onChange={setPropertyPrice}
            suffix="만원"
            placeholder="50,000"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">부동산 유형</Label>
            <Select
              value={propertyType}
              onValueChange={(v) =>
                setPropertyType(v as '주택' | '오피스텔' | '기타건물' | '토지')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="주택">주택</SelectItem>
                <SelectItem value="오피스텔">오피스텔</SelectItem>
                <SelectItem value="기타건물">기타건물</SelectItem>
                <SelectItem value="토지">토지</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">지역</Label>
            <Select
              value={region}
              onValueChange={(v) =>
                setRegion(v as '서울' | '수도권' | '광역시' | '기타지역')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="수도권">수도권</SelectItem>
                <SelectItem value="광역시">광역시</SelectItem>
                <SelectItem value="기타지역">기타지역</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NumberInput
            label="전용면적"
            value={area}
            onChange={setArea}
            suffix="㎡"
            placeholder="85"
          />

          {propertyType === '주택' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">주택 수</Label>
                <Select
                  value={housingCount}
                  onValueChange={(v) =>
                    setHousingCount(v as '1주택' | '2주택' | '3주택이상')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1주택">1주택</SelectItem>
                    <SelectItem value="2주택">2주택</SelectItem>
                    <SelectItem value="3주택이상">3주택 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isFirstTimeBuyer}
                    onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
                    className="w-4 h-4"
                  />
                  생애최초 주택구입 (최대 200만원 감면)
                </Label>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelfRegistration}
                onChange={(e) => setIsSelfRegistration(e.target.checked)}
                className="w-4 h-4"
              />
              셀프등기 (법무사 비용 제외)
            </Label>
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
      <InfoSection slug="registration-cost" />
      <Disclaimer />
    </div>
  )
}
