export interface CalculatorResult {
  readonly label: string
  readonly value: number
  readonly formatted: string
  readonly description?: string
}

export interface CalculatorSection {
  readonly title: string
  readonly results: readonly CalculatorResult[]
}

export type HousingType = 'apartment' | 'house' | 'officetel' | 'etc'

export type RegulationStatus = 'speculation' | 'overheated' | 'regulated' | 'none'

export type RepaymentMethod =
  | 'equal-principal-interest'
  | 'equal-principal'
  | 'bullet'
