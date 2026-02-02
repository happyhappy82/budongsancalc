import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface CalculatorCardProps {
  readonly title: string
  readonly description: string
  readonly children: ReactNode
}

export const CalculatorCard = ({
  title,
  description,
  children,
}: CalculatorCardProps) => {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow border-border/60">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
