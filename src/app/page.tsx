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
  FileText,
  Stamp,
  Gavel,
  UserX,
  ClipboardCheck,
  Handshake,
  Building2,
  Percent,
  Ruler,
  Calculator,
  FileCheck,
  Heart,
  BarChart3,
  Banknote,
  Shield,
  Wallet,
  CalendarDays,
  Gift,
  Users,
  DollarSign,
  Home,
  ArrowDownUp,
  BadgePercent,
  Clock,
  Coins,
  SquareStack,
  MapPin,
  LineChart,
  Hammer,
  ScrollText,
  Briefcase,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CalcCategory {
  readonly label: string
  readonly items: readonly CalcItem[]
}

interface CalcItem {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly features: readonly string[]
  readonly icon: LucideIcon
  readonly iconBg: string
  readonly iconColor: string
  readonly accentDot: string
}

const CATEGORIES: readonly CalcCategory[] = [
  {
    label: '세금',
    items: [
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
        title: '보유세 통합 계산기',
        description: '재산세와 종합부동산세를 한번에 계산합니다.',
        href: '/holding-tax',
        features: ['재산세+종부세 통합', '1세대1주택 특례', '도시지역분·교육세'],
        icon: Shield,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        accentDot: 'bg-indigo-400',
      },
      {
        title: '증여세 계산기',
        description: '부동산 증여 시 납부할 증여세를 계산합니다.',
        href: '/gift-tax',
        features: ['증여공제 적용', '누진세율 10~50%', '세대생략 할증'],
        icon: Gift,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        accentDot: 'bg-pink-400',
      },
      {
        title: '상속세 계산기',
        description: '상속 재산에 대한 상속세를 계산합니다.',
        href: '/inheritance-tax',
        features: ['기초공제·일괄공제', '누진세율 10~50%', '배우자공제'],
        icon: ScrollText,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        accentDot: 'bg-amber-400',
      },
      {
        title: '종합소득세 계산기',
        description: '부동산 소득에 대한 종합소득세를 계산합니다.',
        href: '/income-tax',
        features: ['기본공제·표준공제', '누진세율 6~45%', '세액공제 적용'],
        icon: DollarSign,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        accentDot: 'bg-green-400',
      },
      {
        title: '임대소득세 계산기',
        description: '부동산 임대소득에 대한 세금을 계산합니다.',
        href: '/rental-income-tax',
        features: ['분리과세·종합과세', '필요경비율 적용', '기본공제 400만원'],
        icon: Coins,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        accentDot: 'bg-orange-400',
      },
      {
        title: '인지세 계산기',
        description: '부동산 거래계약서 작성 시 납부해야 하는 인지세를 계산합니다.',
        href: '/stamp-tax',
        features: ['거래금액별 세액', '1천만원 이하 비과세', '간편 조회'],
        icon: Stamp,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        accentDot: 'bg-pink-400',
      },
      {
        title: '지역자원시설세 계산기',
        description: '건축물에 부과되는 지역자원시설세(소방분)를 계산합니다.',
        href: '/regional-tax',
        features: ['건물가액별 세액', '누진세율 적용', '화재위험건축물 가산'],
        icon: Building2,
        iconBg: 'bg-lime-100',
        iconColor: 'text-lime-600',
        accentDot: 'bg-lime-400',
      },
      {
        title: '누진세율 계산기',
        description: '소득세·양도세 등 누진세율을 적용한 세액을 계산합니다.',
        href: '/progressive-tax',
        features: ['구간별 누진세율', '세액공제 적용', '실효세율 확인'],
        icon: BarChart3,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accentDot: 'bg-purple-400',
      },
      {
        title: '건물분 부가세 계산기',
        description: '부동산 거래 시 건물가액에 대한 부가가치세를 계산합니다.',
        href: '/building-vat',
        features: ['건물가 자동계산', '부가세 10% 산정', '토지·건물 안분'],
        icon: FileCheck,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        accentDot: 'bg-yellow-400',
      },
      {
        title: '착한임대인 세액공제 계산기',
        description: '월세를 인하한 임대인에게 제공되는 세액공제를 계산합니다.',
        href: '/good-landlord',
        features: ['70% 세액공제', '소득세율별 절세액', '실질부담감소액'],
        icon: Heart,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        accentDot: 'bg-red-400',
      },
    ],
  },
  {
    label: '대출',
    items: [
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
        title: 'DSR 계산기',
        description: '총부채원리금상환비율(DSR)을 계산합니다.',
        href: '/dsr',
        features: ['스트레스 금리 반영', '1·2금융권 기준', '기타부채 포함'],
        icon: BadgePercent,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accentDot: 'bg-blue-400',
      },
      {
        title: 'DTI 계산기',
        description: '총부채상환비율(DTI)을 계산합니다.',
        href: '/dti',
        features: ['원리금 상환 기준', '기타부채 이자상환', '금융권별 기준'],
        icon: Wallet,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        accentDot: 'bg-teal-400',
      },
      {
        title: 'LTV 계산기',
        description: '담보인정비율(LTV)에 따른 최대 대출가능금액을 계산합니다.',
        href: '/ltv',
        features: ['차주유형별 LTV', '지역별 규제비율', '최대대출액 산출'],
        icon: Home,
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        accentDot: 'bg-sky-400',
      },
      {
        title: '최대대출금액 계산기',
        description: '소득과 담보가치 기준 최대 대출가능금액을 계산합니다.',
        href: '/max-loan',
        features: ['LTV·DTI·DSR 통합', '지역별·주택수별', '금융권별 한도'],
        icon: Banknote,
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        accentDot: 'bg-emerald-400',
      },
      {
        title: '경락대출한도 계산기',
        description: '경매 낙찰 시 가능한 대출한도를 계산합니다.',
        href: '/foreclosure-loan',
        features: ['금융권별 LTV', '차주유형별 한도', '지역별 규제반영'],
        icon: Hammer,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        accentDot: 'bg-slate-400',
      },
      {
        title: '장래소득 추정 계산기',
        description: '연령별 소득증가율을 적용한 장래소득을 추정합니다.',
        href: '/future-income',
        features: ['연령대별 증가율', 'DSR 산정용', '5년간 추정소득'],
        icon: LineChart,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        accentDot: 'bg-orange-400',
      },
      {
        title: '중도상환수수료 계산기',
        description: '대출 조기상환 시 발생하는 중도상환수수료를 계산합니다.',
        href: '/early-repayment',
        features: ['잔여기간별 수수료', '감면율 적용', '순부담액 계산'],
        icon: Clock,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        accentDot: 'bg-red-400',
      },
      {
        title: '연체이자 계산기',
        description: '대출 연체 시 발생하는 연체이자를 계산합니다.',
        href: '/overdue-interest',
        features: ['연체일수별 이자', '가산금리 적용', '복리·단리 선택'],
        icon: CalendarDays,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        accentDot: 'bg-amber-400',
      },
      {
        title: '예적금이자 계산기',
        description: '예금·적금의 이자와 세후 수령액을 계산합니다.',
        href: '/savings-interest',
        features: ['단리·복리 계산', '세후이자 산출', '월복리 적용'],
        icon: PiggyBank,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        accentDot: 'bg-green-400',
      },
    ],
  },
  {
    label: '임대차',
    items: [
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
        title: '임대료 인상률 계산기',
        description: '임대차 갱신 시 인상률을 계산합니다.',
        href: '/rent-increase',
        features: ['5% 상한 계산', '전세·월세 구분', '인상가능금액 산출'],
        icon: ArrowDownUp,
        iconBg: 'bg-cyan-100',
        iconColor: 'text-cyan-600',
        accentDot: 'bg-cyan-400',
      },
      {
        title: '임대료 조정 계산기',
        description: '전세·월세 전환 시 조정 금액을 계산합니다.',
        href: '/rent-adjust',
        features: ['보증금↔월세 조정', '전환율 적용', '적정금액 산출'],
        icon: ArrowRightLeft,
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        accentDot: 'bg-violet-400',
      },
      {
        title: '간주임대료 계산기',
        description: '전세보증금에 대한 간주임대료를 계산합니다.',
        href: '/deemed-rental',
        features: ['국세청 이자율 적용', '보증금 기준', '과세소득 산출'],
        icon: Coins,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        accentDot: 'bg-orange-400',
      },
    ],
  },
  {
    label: '투자·수익',
    items: [
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
      {
        title: '임대수익률 계산기',
        description: '부동산 임대투자의 총수익률, 순수익률, 캡레이트를 계산합니다.',
        href: '/rental-yield',
        features: ['총수익률·순수익률', 'ROI·캡레이트', '레버리지 효과 분석'],
        icon: Percent,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        accentDot: 'bg-green-400',
      },
      {
        title: 'RTI 계산기',
        description: '임대수익 대비 이자상환비율(RTI)을 계산합니다.',
        href: '/rti',
        features: ['연간 임대수입 기준', '대출이자 대비', '1.25·1.5배 기준'],
        icon: BarChart3,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        accentDot: 'bg-teal-400',
      },
      {
        title: '추정소득 계산기',
        description: '부동산 투자의 추정소득을 계산합니다.',
        href: '/estimated-income',
        features: ['임대수익 추정', '공실률 반영', '순영업소득 산출'],
        icon: LineChart,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        accentDot: 'bg-indigo-400',
      },
      {
        title: '재건축 초과이익 환수 계산기',
        description: '재건축 초과이익 환수 부담금을 계산합니다.',
        href: '/reconstruction',
        features: ['초과이익 산정', '면제·감면 적용', '부담금 계산'],
        icon: Building2,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accentDot: 'bg-purple-400',
      },
    ],
  },
  {
    label: '경매',
    items: [
      {
        title: '경매비용 계산기',
        description: '부동산 경매 낙찰 시 필요한 부대비용을 계산합니다.',
        href: '/auction-cost',
        features: ['취득세·명도비용', '수리비·이사비용', '실투자금액 산출'],
        icon: Gavel,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        accentDot: 'bg-slate-400',
      },
      {
        title: '배당 계산기',
        description: '경매 배당금 분배 순서와 금액을 계산합니다.',
        href: '/auction-distribution',
        features: ['권리순위별 배당', '배당순위 확인', '잔여금액 산출'],
        icon: SquareStack,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        accentDot: 'bg-slate-400',
      },
      {
        title: '명도비용 계산기',
        description: '경매 낙찰 후 점유자를 내보내기 위한 명도비용을 계산합니다.',
        href: '/eviction-cost',
        features: ['면적별 집행비용', '송달료·집행관수수료', '보관비용 포함'],
        icon: UserX,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        accentDot: 'bg-red-400',
      },
    ],
  },
  {
    label: '비용·수수료',
    items: [
      {
        title: '등기비용 계산기',
        description: '부동산 등기 시 필요한 총 비용을 계산합니다.',
        href: '/registration-cost',
        features: ['취득세·교육세', '국민주택채권', '법무사보수 포함'],
        icon: FileText,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        accentDot: 'bg-indigo-400',
      },
      {
        title: '법무사보수 계산기',
        description: '등기 대행 시 법무사 보수를 계산합니다.',
        href: '/attorney-fee',
        features: ['금액별 누진 보수', '부가세 10% 포함', '기본보수+초과보수'],
        icon: Briefcase,
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        accentDot: 'bg-gray-400',
      },
      {
        title: '국민주택채권 계산기',
        description: '부동산 등기 시 의무 매입해야 하는 채권 비용을 계산합니다.',
        href: '/housing-bond',
        features: ['지역별 매입비율', '할인율 6% 적용', '실제 부담액 계산'],
        icon: FileText,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        accentDot: 'bg-indigo-400',
      },
      {
        title: '감정평가수수료 계산기',
        description: '부동산 감정평가 의뢰 시 발생하는 수수료를 계산합니다.',
        href: '/appraisal-fee',
        features: ['금액별 누진 요율', '부가세 10% 포함', '기본수수료 산정'],
        icon: ClipboardCheck,
        iconBg: 'bg-teal-100',
        iconColor: 'text-teal-600',
        accentDot: 'bg-teal-400',
      },
      {
        title: '중개보수 계산기',
        description: '부동산 거래 시 발생하는 중개보수를 계산합니다.',
        href: '/brokerage',
        features: ['매매·전세·월세 구분', '주택·오피스텔·상가', '서울 기준 요율'],
        icon: Handshake,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accentDot: 'bg-purple-400',
      },
    ],
  },
  {
    label: '건물·부동산 분석',
    items: [
      {
        title: '건폐율·용적률 계산기',
        description: '대지면적 대비 건축면적 비율과 연면적 비율을 계산합니다.',
        href: '/building-ratio',
        features: ['건폐율 산정', '용적률 산정', '평균 층별면적'],
        icon: Ruler,
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        accentDot: 'bg-sky-400',
      },
      {
        title: '건물기준시가 계산기',
        description: '건물의 과세표준 산정을 위한 기준시가를 계산합니다.',
        href: '/building-price',
        features: ['신축가격기준액 적용', '구조·용도·위치지수', '경과연수별 잔가율'],
        icon: Calculator,
        iconBg: 'bg-fuchsia-100',
        iconColor: 'text-fuchsia-600',
        accentDot: 'bg-fuchsia-400',
      },
      {
        title: '토지지분가 계산기',
        description: '공동주택의 토지지분 가액을 계산합니다.',
        href: '/land-share',
        features: ['대지지분 기준', '공시지가 적용', '토지가액 산출'],
        icon: MapPin,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        accentDot: 'bg-green-400',
      },
      {
        title: '기준시가 단가 계산기',
        description: '오피스텔·상업용건물의 기준시가 단가를 조회합니다.',
        href: '/unit-price',
        features: ['오피스텔 기준시가', '상업용 건물 단가', '면적별 가액 산출'],
        icon: Calculator,
        iconBg: 'bg-fuchsia-100',
        iconColor: 'text-fuchsia-600',
        accentDot: 'bg-fuchsia-400',
      },
      {
        title: '잔존가치 계산기',
        description: '건물의 경과연수에 따른 잔존가치를 계산합니다.',
        href: '/remaining-value',
        features: ['내용연수 기준', '정액법·정률법', '잔존율 산출'],
        icon: Building2,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        accentDot: 'bg-slate-400',
      },
    ],
  },
  {
    label: '유틸리티',
    items: [
      {
        title: '면적 변환 계산기',
        description: '평(坪), m², ft² 등 면적 단위를 상호 변환합니다.',
        href: '/area-convert',
        features: ['평 ↔ m² 변환', 'ft² ↔ m² 변환', '다양한 단위 지원'],
        icon: Ruler,
        iconBg: 'bg-sky-100',
        iconColor: 'text-sky-600',
        accentDot: 'bg-sky-400',
      },
      {
        title: '날짜 계산기',
        description: '보유기간, 거주기간 등 일수를 계산합니다.',
        href: '/date-calc',
        features: ['기간 일수 계산', 'D-day 계산', '영업일 계산'],
        icon: CalendarDays,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        accentDot: 'bg-amber-400',
      },
      {
        title: '상속지분 계산기',
        description: '법정상속분에 따른 상속인별 지분을 계산합니다.',
        href: '/inheritance-share',
        features: ['법정상속순위', '배우자 가산', '상속인별 지분율'],
        icon: Users,
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-600',
        accentDot: 'bg-pink-400',
      },
    ],
  },
]

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient-brand">
          부동산 계산기
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          세금, 대출, 임대차, 투자 수익률까지 부동산 계산을 한 곳에서.
        </p>
      </div>

      {CATEGORIES.map((category) => (
        <section key={category.label} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground border-b pb-2">
            {category.label}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {category.items.map((calc) => {
              const Icon = calc.icon
              return (
                <Link key={calc.href} href={calc.href} className="block group">
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border-border/60">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-xl p-2.5 ${calc.iconBg} ${calc.iconColor} shrink-0`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {calc.title}
                          </CardTitle>
                          <CardDescription>
                            {calc.description}
                          </CardDescription>
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
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${calc.accentDot} flex-shrink-0`}
                            />
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
        </section>
      ))}
    </div>
  )
}
