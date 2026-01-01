"use client"

import * as React from "react"
import { BadgeCheck, ArrowRight } from "lucide-react"
import NumberFlow from "@number-flow/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GlowingEffect } from "@/components/ui/glowing-effect"

export interface PricingTier {
  name: string
  price: Record<string, number | string>
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
  popular?: boolean
}

interface PricingCardProps {
  tier: PricingTier
  paymentFrequency: string
  onSelect?: (tierName: string) => void
}

export function PricingCard({ tier, paymentFrequency, onSelect }: PricingCardProps) {
  const price = tier.price[paymentFrequency]
  const isHighlighted = tier.highlighted
  const isPopular = tier.popular

  return (
    <div className="relative rounded-xl h-full">
      <GlowingEffect
        variant="cyan"
        blur={0}
        borderWidth={1}
        spread={15}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <Card
        className={cn(
          "relative flex flex-col gap-5 md:gap-8 overflow-hidden p-4 md:p-6 h-full rounded-xl border border-white/10",
          isHighlighted
            ? "bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 text-foreground"
            : "bg-background text-foreground"
        )}
      >
        {isHighlighted && <HighlightedBackground />}
        {isPopular && <PopularBackground />}

        <h2 className="flex items-center gap-2 md:gap-3 text-lg md:text-xl font-medium capitalize">
          {tier.name}
          {isPopular && (
            <Badge variant="secondary" className="mt-1 z-10 text-xs">
              Popular
            </Badge>
          )}
        </h2>

        <div className="relative h-10 md:h-12">
          {typeof price === "number" ? (
            <>
              <NumberFlow
                format={{
                  style: "currency",
                  currency: "INR",
                  trailingZeroDisplay: "stripIfInteger",
                }}
                value={price}
                className="text-3xl md:text-4xl font-medium"
              />
              <p className={cn(
                "-mt-2 text-xs",
                isHighlighted ? "text-cyan-300/60" : "text-muted-foreground"
              )}>
                Per month
              </p>
            </>
          ) : (
            <h1 className="text-3xl md:text-4xl font-medium">{price}</h1>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-medium">{tier.description}</h3>
          <ul className="space-y-2">
            {tier.features.map((feature, index) => (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium",
                  isHighlighted ? "text-cyan-100/80" : "text-muted-foreground"
                )}
              >
                <BadgeCheck className="h-4 w-4 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button
          variant="default"
          className={cn(
            "w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 relative z-10"
          )}
          onClick={() => onSelect?.(tier.name)}
        >
          {tier.cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Card>
    </div>
  )
}

const HighlightedBackground = () => (
  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,200,200,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,200,200,0.1)_1px,transparent_1px)] bg-[size:45px_45px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
)

const PopularBackground = () => (
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />
)
