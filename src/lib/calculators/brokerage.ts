import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'

const logger = createLogger('brokerage.ts')

export type ContractType = '매매' | '전세' | '월세'
export type PropertyType = '주택' | '오피스텔' | '그외'

export interface BrokerageInput {
  readonly contractType: ContractType
  readonly propertyType: PropertyType
  readonly transactionAmount: number
  readonly monthlyRent?: number
}

export interface BrokerageResult {
  readonly effectiveAmount: number
  readonly commission: number
  readonly appliedRate: number
  readonly vat: number
  readonly totalWithVAT: number
  readonly hasVAT: boolean
}

const inputSchema = z.object({
  contractType: z.enum(['매매', '전세', '월세']),
  propertyType: z.enum(['주택', '오피스텔', '그외']),
  transactionAmount: z.number().gte(0, '거래금액은 0 이상이어야 합니다.'),
  monthlyRent: z.number().gte(0, '월세는 0 이상이어야 합니다.').optional(),
})

interface RateInfo {
  rate: number
  max?: number
}

const calculateHousingSaleRate = (amount: number): RateInfo => {
  if (amount < 50_000_000) {
    return { rate: 0.6, max: 250_000 }
  } else if (amount < 200_000_000) {
    return { rate: 0.5, max: 800_000 }
  } else if (amount < 900_000_000) {
    return { rate: 0.4 }
  } else if (amount < 1_200_000_000) {
    return { rate: 0.5 }
  } else if (amount < 1_500_000_000) {
    return { rate: 0.6 }
  } else {
    return { rate: 0.7 }
  }
}

const calculateHousingRentalRate = (amount: number): RateInfo => {
  if (amount < 50_000_000) {
    return { rate: 0.5, max: 200_000 }
  } else if (amount < 100_000_000) {
    return { rate: 0.4, max: 300_000 }
  } else if (amount < 600_000_000) {
    return { rate: 0.3 }
  } else if (amount < 1_200_000_000) {
    return { rate: 0.4 }
  } else if (amount < 1_500_000_000) {
    return { rate: 0.5 }
  } else {
    return { rate: 0.6 }
  }
}

const calculateCommissionAmount = (
  contractType: ContractType,
  propertyType: PropertyType,
  effectiveAmount: number
): { commission: number; appliedRate: number } => {
  let rateInfo: RateInfo

  if (propertyType === '주택') {
    if (contractType === '매매') {
      rateInfo = calculateHousingSaleRate(effectiveAmount)
    } else {
      rateInfo = calculateHousingRentalRate(effectiveAmount)
    }
  } else if (propertyType === '오피스텔') {
    rateInfo = contractType === '매매' ? { rate: 0.5 } : { rate: 0.4 }
  } else {
    rateInfo = { rate: 0.9 }
  }

  const calculatedCommission = roundToWon((effectiveAmount * rateInfo.rate) / 100)
  const commission = rateInfo.max
    ? Math.min(calculatedCommission, rateInfo.max)
    : calculatedCommission

  return {
    commission,
    appliedRate: rateInfo.rate,
  }
}

export const calculateBrokerage = (input: BrokerageInput): BrokerageResult => {
  logger.logEntry('calculateBrokerage', { ...input })

  try {
    const validated = inputSchema.parse(input)
    const { contractType, propertyType, transactionAmount, monthlyRent } =
      validated

    // 월세인 경우 환산 금액 계산
    let effectiveAmount = transactionAmount
    if (contractType === '월세') {
      if (!monthlyRent || monthlyRent === 0) {
        throw new Error('월세 계약의 경우 월세액을 입력해야 합니다.')
      }

      // 보증금 + (월세 * 100)
      const calculated = transactionAmount + monthlyRent * 100

      // 5천만원 미만이면 보증금 + (월세 * 70) 사용
      if (calculated < 50_000_000) {
        effectiveAmount = transactionAmount + monthlyRent * 70
      } else {
        effectiveAmount = calculated
      }
    }

    const { commission, appliedRate } = calculateCommissionAmount(
      contractType,
      propertyType,
      effectiveAmount
    )

    // 오피스텔과 그외의 경우 VAT 적용
    const hasVAT = propertyType === '오피스텔' || propertyType === '그외'
    const vat = hasVAT ? roundToWon(commission * 0.1) : 0
    const totalWithVAT = commission + vat

    const result: BrokerageResult = {
      effectiveAmount,
      commission,
      appliedRate,
      vat,
      totalWithVAT,
      hasVAT,
    }

    logger.logExit('calculateBrokerage', result)
    return result
  } catch (error) {
    logger.error('calculateBrokerage - error', error)
    throw error
  }
}
