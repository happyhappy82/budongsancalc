import { createLogger } from './logger'

const logger = createLogger('format.ts')

export const formatKRW = (amount: number): string => {
  logger.logEntry('formatKRW', { amount })
  const result = `${formatNumber(Math.round(amount))}원`
  logger.logExit('formatKRW', result)
  return result
}

export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR')
}

export const parseNumberString = (str: string): number => {
  logger.logEntry('parseNumberString', { str })

  const cleaned = str.replace(/,/g, '')
  const parsed = Number(cleaned)

  if (isNaN(parsed)) {
    throw new Error(`"${str}"을(를) 숫자로 변환할 수 없습니다.`)
  }

  logger.logExit('parseNumberString', parsed)
  return parsed
}

export const formatPercent = (rate: number): string => {
  return `${rate}%`
}

export const formatManWon = (amount: number): string => {
  logger.logEntry('formatManWon', { amount })

  const absAmount = Math.abs(Math.round(amount))
  const sign = amount < 0 ? '-' : ''
  const eok = Math.floor(absAmount / 100_000_000)
  const man = Math.floor((absAmount % 100_000_000) / 10_000)
  const remainder = absAmount % 10_000

  let result = sign
  if (eok > 0) {
    result += `${formatNumber(eok)}억`
    if (man > 0) result += ` ${formatNumber(man)}만`
    if (remainder > 0) result += ` ${formatNumber(remainder)}`
    result += '원'
  } else if (man > 0) {
    result += `${formatNumber(man)}만`
    if (remainder > 0) result += ` ${formatNumber(remainder)}`
    result += '원'
  } else {
    result += `${formatNumber(absAmount)}원`
  }

  logger.logExit('formatManWon', result)
  return result
}
