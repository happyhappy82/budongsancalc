import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowRightLeft,
  Receipt,
  Scale,
  House,
  Landmark,
  PiggyBank,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CALCULATORS: readonly {
  title: string
  description: string
  href: string
  features: readonly string[]
  icon: LucideIcon
  iconBg: string
  iconColor: string
  accentDot: string
}[] = [
  {
    title: '월세/전세 변환',
    description: '전세를 월세로, 월세를 전세로 변환합니다.',
    href: '/rent-convert',
    features: ['전세 → 월세 변환', '월세 → 전세 변환', '전환율 기반 계산'],
    icon: ArrowRightLeft,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accentDot: 'bg-blue-400',
  },
  {
    title: '취득세 계산기',
    description: '부동산 매입 시 납부할 취득세를 계산합니다.',
    href: '/acquisition-tax',
    features: ['주택 수별 세율', '조정지역 중과', '생애최초 감면'],
    icon: Receipt,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    accentDot: 'bg-violet-400',
  },
  {
    title: '양도소득세 계산기',
    description: '부동산 매도 시 양도소득세를 계산합니다.',
    href: '/transfer-tax',
    features: ['1세대1주택 비과세', '장기보유특별공제', '고가주택 안분'],
    icon: Scale,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accentDot: 'bg-amber-400',
  },
  {
    title: '재산세 계산기',
    description: '보유 주택의 재산세를 계산합니다.',
    href: '/property-tax',
    features: ['공시가격 기준 계산', '누진세율 적용', '도시지역분·지방교육세'],
    icon: House,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentDot: 'bg-emerald-400',
  },
  {
    title: '종합부동산세 계산기',
    description: '고가 주택 보유 시 종합부동산세를 계산합니다.',
    href: '/comprehensive-tax',
    features: ['1세대1주택 12억 공제', '고령자·장기보유 공제', '누진세율 0.5~2.7%'],
    icon: Landmark,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    accentDot: 'bg-rose-400',
  },
  {
    title: '대출/상환 계산기',
    description: '대출 상환 스케줄과 최대 대출 가능액을 확인합니다.',
    href: '/loan',
    features: ['원리금균등/원금균등/만기일시', 'LTV·DSR 한도', '스트레스 DSR'],
    icon: PiggyBank,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    accentDot: 'bg-cyan-400',
  },
  {
    title: '투자 수익률 계산기',
    description: '부동산 투자 수익률을 종합 분석합니다.',
    href: '/investment-return',
    features: ['ROI·연환산 수익률', '캡레이트·레버리지', '시세차익+임대수익'],
    icon: TrendingUp,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    accentDot: 'bg-orange-400',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-brand">
          부동산 계산기
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          세금, 대출, 임대차, 투자 수익률까지 부동산 계산을 한 곳에서.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CALCULATORS.map((calc) => {
          const Icon = calc.icon
          return (
            <Link key={calc.href} href={calc.href} className="block group">
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/60">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-2.5 ${calc.iconBg} ${calc.iconColor} shrink-0`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {calc.title}
                      </CardTitle>
                      <CardDescription>{calc.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {calc.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-sm text-muted-foreground flex items-center gap-2"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${calc.accentDot} flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
