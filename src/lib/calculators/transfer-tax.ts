import { z } from 'zod'
import { createLogger } from '@/lib/utils/logger'
import { roundToWon } from '@/lib/utils/math'
import {
  getTaxBracket,
  BASIC_DEDUCTION,
  LOCAL_INCOME_TAX_RATE,
  HIGH_VALUE_THRESHOLD,
  SHORT_TERM_RATES,
} from '@/lib/constants/transfer-tax-rates'
import {
  getGeneralDeductionRate,
  getSingleHomeDeductionRate,
} from '@/lib/constants/long-term-deduction'

const logger = createLogger('transfer-tax.ts')

export interface TransferTaxInput {
  readonly acquisitionPrice: number
  readonly transferPrice: number
  readonly expenses: number
  readonly holdingYears: number
  readonly residenceYears: number
  readonly housingCount: number
  readonly isSingleHousehold: boolean
  readonly isRegulated: boolean
}

export interface TransferTaxResult {
  readonly capitalGain: number
  readonly longTermDeduction: number
  readonly longTermDeductionRate: number
  readonly taxableIncome: number
  readonly taxBase: number
  readonly taxRate: number
  readonly progressiveDeduction: number
  readonly calculatedTax: number
  readonly localIncomeTax: number
  readonly totalTax: number
  readonly effectiveRate: number
  readonly isTaxExempt: boolean
  readonly taxExemptReason?: string
}

const inputSchema = z.object({
  acquisitionPrice: z.number().min(0),
  transferPrice: z.number().min(0),
  expenses: z.number().min(0),
  holdingYears: z.number().min(0),
  residenceYears: z.number().min(0),
  housingCount: z.number().int().min(1),
  isSingleHousehold: z.boolean(),
  isRegulated: z.boolean(),
})

const checkTaxExemption = (
  input: TransferTaxInput
): { exempt: boolean; reason?: string } => {
  const { transferPrice, holdingYears, residenceYears, housingCount, isSingleHousehold } = input

  if (
    isSingleHousehold &&
    housingCount === 1 &&
    holdingYears >= 2 &&
    residenceYears >= 2 &&
    transferPrice <= HIGH_VALUE_THRESHOLD
  ) {
    return { exempt: true, reason: '1세대 1주택 비과세 (양도가 12억 이하, 2년 보유+거주)' }
  }
  return { exempt: false }
}

const calculateHighValueRatio = (transferPrice: number): number => {
  if (transferPrice <= HIGH_VALUE_THRESHOLD) return 1
  return (transferPrice - HIGH_VALUE_THRESHOLD) / transferPrice
}

export const calculateTransferTax = (
  input: TransferTaxInput
): TransferTaxResult => {
  logger.logEntry('calculateTransferTax', { ...input })

  try {
    const validated = inputSchema.parse(input)

    const exemption = checkTaxExemption(validated)
    if (exemption.exempt) {
      const result: TransferTaxResult = {
        capitalGain: 0, longTermDeduction: 0, longTermDeductionRate: 0,
        taxableIncome: 0, taxBase: 0, taxRate: 0, progressiveDeduction: 0,
        calculatedTax: 0, localIncomeTax: 0, totalTax: 0, effectiveRate: 0,
        isTaxExempt: true, taxExemptReason: exemption.reason,
      }
      logger.logExit('calculateTransferTax', result)
      return result
    }

    const rawGain = validated.transferPrice - validated.acquisitionPrice - validated.expenses
    if (rawGain <= 0) {
      const result: TransferTaxResult = {
        capitalGain: rawGain, longTermDeduction: 0, longTermDeductionRate: 0,
        taxableIncome: 0, taxBase: 0, taxRate: 0, progressiveDeduction: 0,
        calculatedTax: 0, localIncomeTax: 0, totalTax: 0, effectiveRate: 0,
        isTaxExempt: false, taxExemptReason: '양도차익 없음 (손실)',
      }
      logger.logExit('calculateTransferTax', result)
      return result
    }

    const isSingleHomeOwner =
      validated.isSingleHousehold && validated.housingCount === 1
    const highValueRatio = isSingleHomeOwner
      ? calculateHighValueRatio(validated.transferPrice)
      : 1

    const capitalGain = roundToWon(rawGain * highValueRatio)

    let deductionRate: number
    if (validated.holdingYears < 1) {
      deductionRate = 0
    } else if (isSingleHomeOwner) {
      deductionRate = getSingleHomeDeductionRate(
        validated.holdingYears, validated.residenceYears
      )
    } else {
      deductionRate = getGeneralDeductionRate(validated.holdingYears)
    }

    const longTermDeduction = roundToWon(capitalGain * deductionRate)
    const taxableIncome = capitalGain - longTermDeduction
    const taxBase = Math.max(0, taxableIncome - BASIC_DEDUCTION)

    let taxRate: number
    let progressiveDeduction: number

    if (validated.holdingYears < 1) {
      taxRate = SHORT_TERM_RATES.lessThanOneYear
      progressiveDeduction = 0
    } else {
      const bracket = getTaxBracket(taxBase)
      taxRate = bracket.rate
      progressiveDeduction = bracket.deduction
    }

    const calculatedTax = roundToWon(
      Math.max(0, taxBase * taxRate - progressiveDeduction)
    )
    const localIncomeTax = roundToWon(calculatedTax * LOCAL_INCOME_TAX_RATE)
    const totalTax = calculatedTax + localIncomeTax

    const effectiveRate = rawGain > 0
      ? Math.round((totalTax / rawGain) * 10000) / 100
      : 0

    const result: TransferTaxResult = {
      capitalGain, longTermDeduction, longTermDeductionRate: Math.round(deductionRate * 100),
      taxableIncome, taxBase, taxRate: Math.round(taxRate * 100),
      progressiveDeduction, calculatedTax, localIncomeTax,
      totalTax, effectiveRate, isTaxExempt: false,
    }

    logger.logExit('calculateTransferTax', result)
    return result
  } catch (error) {
    logger.error('calculateTransferTax - error', error)
    throw error
  }
}
