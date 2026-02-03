import { BookOpen } from 'lucide-react'
import { CALCULATOR_INFO, type CalcInfo } from '@/lib/constants/calculator-info'

interface InfoSectionProps {
  readonly slug: string
}

export const InfoSection = ({ slug }: InfoSectionProps) => {
  const info: CalcInfo | undefined = CALCULATOR_INFO[slug]
  if (!info) return null

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4 space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <BookOpen className="size-4" />
        <h3 className="text-sm font-semibold">참고 정보</h3>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {info.description}
      </p>

      {info.details && info.details.length > 0 && (
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          {info.details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}

      {info.tables?.map((table, ti) => (
        <div key={ti} className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">
            {table.title}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  {table.headers.map((h, hi) => (
                    <th
                      key={hi}
                      className="border border-border/40 px-2 py-1.5 text-left font-medium text-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="even:bg-muted/20">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="border border-border/40 px-2 py-1 text-muted-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {info.notes && info.notes.length > 0 && (
        <div className="text-xs text-muted-foreground/80 space-y-0.5">
          {info.notes.map((note, i) => (
            <p key={i}>※ {note}</p>
          ))}
        </div>
      )}

    </div>
  )
}
