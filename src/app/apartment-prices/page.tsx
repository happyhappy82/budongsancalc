'use client'

import { useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

const SEOUL_GU_LIST = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
] as const

const TRADE_TYPE_OPTIONS = [
  { value: 'A1', label: '매매' },
  { value: 'B1', label: '전세' },
  { value: 'B2', label: '월세' },
] as const

interface Article {
  articleNo: string
  articleName: string
  tradeTypeName: string
  dealOrWarrantPrc: string
  area1: number
  area2: number
  direction: string
  articleConfirmYmd: string
  articleFeatureDesc: string
  tagList: string[]
  buildingName: string
  floorInfo: string
  cpName: string
  realtorName: string
  representativeImgThumb: string
}

interface ApiResponse {
  isMoreData: boolean
  articleList: Article[]
  error?: string
}

function formatArea(m2: number): string {
  const pyeong = m2 / 3.3058
  return `${m2.toFixed(0)}m² (${pyeong.toFixed(1)}평)`
}

function formatDate(ymd: string): string {
  if (!ymd || ymd.length !== 8) return ymd
  return `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6, 8)}`
}

export default function ApartmentPricesPage() {
  const [gu, setGu] = useState<string>('강남구')
  const [tradeType, setTradeType] = useState<string>('A1')
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchData = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        gu,
        tradeType,
        page: String(pageNum),
      })
      const res = await fetch(`/api/naver-land?${params}`)
      const data: ApiResponse = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      setArticles(data.articleList ?? [])
      setHasMore(data.isMoreData ?? false)
      setPage(pageNum)
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 가져오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [gu, tradeType])

  const handleSearch = () => fetchData(1)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <div className="rounded-xl p-2.5 bg-blue-100 text-blue-600">
            <Building2 className="size-5" />
          </div>
          서울 아파트 호가 조회
        </h1>
        <p className="text-muted-foreground">
          네이버 부동산에 등록된 서울 아파트 매물 호가 정보를 실시간으로 조회합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>검색 조건</CardTitle>
          <CardDescription>구와 거래 유형을 선택하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={gu} onValueChange={setGu}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="구 선택" />
              </SelectTrigger>
              <SelectContent>
                {SEOUL_GU_LIST.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tradeType} onValueChange={setTradeType}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="거래유형" />
              </SelectTrigger>
              <SelectContent>
                {TRADE_TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleSearch} disabled={isLoading} className="sm:w-auto w-full">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {isLoading ? '조회 중...' : '조회하기'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {searched && !error && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {articles.length > 0
                ? `${gu} 아파트 ${TRADE_TYPE_OPTIONS.find(t => t.value === tradeType)?.label} 매물 (${page}페이지)`
                : '검색 결과가 없습니다.'}
            </p>
            {articles.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => fetchData(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                  이전
                </Button>
                <span className="text-sm text-muted-foreground px-2">{page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore || isLoading}
                  onClick={() => fetchData(page + 1)}
                >
                  다음
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            {articles.map((article) => (
              <Card key={article.articleNo} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {article.representativeImgThumb && (
                      <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.representativeImgThumb}
                          alt={article.articleName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base truncate">
                            {article.articleName}
                          </h3>
                          {article.buildingName && (
                            <p className="text-sm text-muted-foreground truncate">
                              {article.buildingName}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-base font-bold">
                          {article.dealOrWarrantPrc}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatArea(article.area2)}</span>
                        {article.floorInfo && <span>{article.floorInfo}층</span>}
                        {article.direction && <span>{article.direction}</span>}
                        <span>{article.tradeTypeName}</span>
                      </div>

                      {article.articleFeatureDesc && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {article.articleFeatureDesc}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {article.tagList?.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDate(article.articleConfirmYmd)}
                          {article.realtorName && ` · ${article.realtorName}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {articles.length > 0 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isLoading}
                onClick={() => fetchData(page - 1)}
              >
                <ChevronLeft className="size-4" />
                이전 페이지
              </Button>
              <Button
                variant="outline"
                disabled={!hasMore || isLoading}
                onClick={() => fetchData(page + 1)}
              >
                다음 페이지
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            본 정보는 네이버 부동산에 등록된 매물 호가 정보이며, 실제 거래가와 다를 수 있습니다.
            매물 정보는 중개사가 등록한 것으로 정확성을 보장하지 않습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
