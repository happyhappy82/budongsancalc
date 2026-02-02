import { AlertTriangle } from 'lucide-react'

export const Disclaimer = () => {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mt-4 flex items-start gap-2.5">
      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 leading-relaxed">
        본 계산기의 결과는 참고용이며 법적 효력이 없습니다.
        실제 부동산 거래 시 세무사 또는 금융기관의 상담을 받으시기 바랍니다.
        세율 및 규정은 법령 개정에 따라 변경될 수 있습니다.
      </p>
    </div>
  )
}
