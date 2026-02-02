type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

interface Logger {
  debug: (message: string, data?: Record<string, unknown>) => void
  info: (message: string, data?: Record<string, unknown>) => void
  warn: (message: string, data?: Record<string, unknown>) => void
  error: (message: string, error?: unknown) => void
  logEntry: (fnName: string, params: Record<string, unknown>) => void
  logExit: (fnName: string, result: unknown) => void
}

const formatMessage = (
  fileName: string,
  level: LogLevel,
  message: string
): string => {
  return `[${new Date().toISOString()}] [${fileName}] [${level}] ${message}`
}

const stringify = (data: unknown): string => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

export const createLogger = (fileName: string): Logger => ({
  debug: (message, data) => {
    const msg = data
      ? `${message} ${stringify(data)}`
      : message
    console.debug(formatMessage(fileName, 'DEBUG', msg))
  },

  info: (message, data) => {
    const msg = data
      ? `${message} ${stringify(data)}`
      : message
    console.info(formatMessage(fileName, 'INFO', msg))
  },

  warn: (message, data) => {
    const msg = data
      ? `${message} ${stringify(data)}`
      : message
    console.warn(formatMessage(fileName, 'WARN', msg))
  },

  error: (message, error) => {
    let msg = message
    if (error instanceof Error) {
      msg += `\nError: ${error.message}`
      if (error.stack) {
        msg += `\nStack: ${error.stack}`
      }
    }
    console.error(formatMessage(fileName, 'ERROR', msg))
  },

  logEntry: (fnName, params) => {
    console.debug(
      formatMessage(fileName, 'DEBUG', `${fnName} - entry ${stringify(params)}`)
    )
  },

  logExit: (fnName, result) => {
    console.debug(
      formatMessage(fileName, 'DEBUG', `${fnName} - exit ${stringify(result)}`)
    )
  },
})
