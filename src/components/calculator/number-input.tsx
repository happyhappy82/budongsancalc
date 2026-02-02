'use client'

import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NumberInputProps {
  readonly label: string
  readonly value: number
  readonly onChange: (value: number) => void
  readonly suffix?: string
  readonly placeholder?: string
  readonly min?: number
  readonly max?: number
  readonly helpText?: string
  readonly id?: string
}

export const NumberInput = ({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  min,
  max,
  helpText,
  id,
}: NumberInputProps) => {
  const inputId = id ?? label.replace(/\s/g, '-').toLowerCase()

  const displayValue =
    value === 0 ? '' : value.toLocaleString('ko-KR')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[,\s]/g, '')
      if (raw === '') {
        onChange(0)
        return
      }
      if (/[eE]/.test(raw)) return
      if (/[^0-9.]/.test(raw)) return
      const num = Number(raw)
      if (isNaN(num) || !isFinite(num)) return
      if (min !== undefined && num < min) return
      if (max !== undefined && num > max) return
      onChange(num)
    },
    [onChange, min, max]
  )

  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder ?? '0'}
          className="pr-10"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}
    </div>
  )
}
