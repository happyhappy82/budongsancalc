export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">&copy; {year} 부동산 계산기</p>
        <p className="text-xs text-muted-foreground">
          본 계산기의 결과는 참고용이며 법적 효력이 없습니다.
          실제 거래 시 세무사 또는 금융기관 상담을 권장합니다.
        </p>
      </div>
    </footer>
  )
}
