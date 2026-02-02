export const roundToWon = (amount: number): number => {
  return Math.round(amount)
}

export const roundTo = (amount: number, decimals: number): number => {
  const factor = Math.pow(10, decimals)
  return Math.round(amount * factor) / factor
}

export const calculateMonthlyRate = (annualRatePercent: number): number => {
  return annualRatePercent / 100 / 12
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}
