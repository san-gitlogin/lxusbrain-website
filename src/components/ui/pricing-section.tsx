"use client"

import * as React from "react"
import { PricingCard, type PricingTier } from "@/components/ui/pricing-card"
import { Tab } from "@/components/ui/pricing-tab"

interface PricingSectionProps {
  title: string
  subtitle: string
  tiers: PricingTier[]
  frequencies: string[]
  onTierSelect?: (tierName: string) => void
}

export function PricingSection({
  title,
  subtitle,
  tiers,
  frequencies,
  onTierSelect,
}: PricingSectionProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0])

  return (
    <section className="flex flex-col items-center gap-8 md:gap-10 py-6 md:py-10">
      <div className="space-y-5 md:space-y-7 text-center">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl sm:text-4xl font-medium md:text-5xl text-foreground">{title}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>
        </div>
        <div className="mx-auto flex w-fit rounded-full bg-muted p-1">
          {frequencies.map((freq) => (
            <Tab
              key={freq}
              text={freq}
              selected={selectedFrequency === freq}
              setSelected={setSelectedFrequency}
              discount={freq === "yearly"}
            />
          ))}
        </div>
      </div>

      <div className="grid w-full max-w-6xl gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <PricingCard
            key={tier.name}
            tier={tier}
            paymentFrequency={selectedFrequency}
            onSelect={onTierSelect}
          />
        ))}
      </div>
    </section>
  )
}
