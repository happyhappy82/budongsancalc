import type { CalculatorSection } from '@/lib/types/calculator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface ResultDisplayProps {
  readonly sections: readonly CalculatorSection[]
}

export const ResultDisplay = ({ sections }: ResultDisplayProps) => {
  if (sections.length === 0) return null

  return (
    <div className="space-y-4" role="region" aria-live="polite" aria-label="계산 결과">
      {sections.map((section) => (
        <Card key={section.title} className="border-border/60 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.results.map((result, rIdx) => (
              <div key={result.label}>
                {rIdx > 0 && <Separator className="my-2" />}
                {rIdx === 0 ? (
                  <div className="flex justify-between items-baseline bg-primary/5 -mx-6 px-6 py-2.5 rounded-sm">
                    <span className="text-sm font-medium text-foreground">
                      {result.label}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {result.formatted}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted-foreground">
                      {result.label}
                    </span>
                    <span className="text-sm font-medium">
                      {result.formatted}
                    </span>
                  </div>
                )}
                {result.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
