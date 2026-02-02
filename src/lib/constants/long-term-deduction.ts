export const GENERAL_DEDUCTION_RATE_PER_YEAR = 0.02
export const GENERAL_DEDUCTION_MIN_YEARS = 3
export const GENERAL_DEDUCTION_MAX_RATE = 0.30

export const SINGLE_HOME_HOLDING_RATE_PER_YEAR = 0.04
export const SINGLE_HOME_RESIDENCE_RATE_PER_YEAR = 0.04
export const SINGLE_HOME_MAX_RATE = 0.80

export const getGeneralDeductionRate = (holdingYears: number): number => {
  if (holdingYears < GENERAL_DEDUCTION_MIN_YEARS) return 0
  const rate = holdingYears * GENERAL_DEDUCTION_RATE_PER_YEAR
  return Math.min(rate, GENERAL_DEDUCTION_MAX_RATE)
}

export const getSingleHomeDeductionRate = (
  holdingYears: number,
  residenceYears: number
): number => {
  const holdingRate = Math.min(
    holdingYears * SINGLE_HOME_HOLDING_RATE_PER_YEAR,
    0.40
  )
  const residenceRate = Math.min(
    residenceYears * SINGLE_HOME_RESIDENCE_RATE_PER_YEAR,
    0.40
  )
  return Math.min(holdingRate + residenceRate, SINGLE_HOME_MAX_RATE)
}
