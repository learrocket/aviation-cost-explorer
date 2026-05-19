import { useState } from 'react';
import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CostBreakdownProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
}

export const CostBreakdown = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
}: CostBreakdownProps) => {
  const [isFixedOpen, setIsFixedOpen] = useState(false);
  const [isVariableOpen, setIsVariableOpen] = useState(false);
  const [isCharterOpen, setIsCharterOpen] = useState(false);

  const groupedFixedCosts = aircraft.fixedCosts.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = [];
    }
    acc[cost.category].push(cost);
    return acc;
  }, {} as Record<string, typeof aircraft.fixedCosts>);

  const dynamicCrewCosts = [
    { name: `Captain(s) × ${captains}`, yearlyEUR: aircraft.crewCosts.captainTotal * captains },
    { name: `First Officer(s) × ${firstOfficers}`, yearlyEUR: aircraft.crewCosts.firstOfficerTotal * firstOfficers },
    { name: `Cabin Crew × ${cabinCrew}`, yearlyEUR: aircraft.crewCosts.cabinCrewTotal * cabinCrew },
    { name: `Flight Engineer(s) × ${flightEngineers}`, yearlyEUR: aircraft.crewCosts.flightEngineerTotal * flightEngineers },
  ].filter(cost => cost.yearlyEUR > 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Detailed Cost Breakdown
      </h3>

      <Collapsible open={isFixedOpen} onOpenChange={setIsFixedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
            <span className="font-medium">Fixed Costs Details</span>
            {isFixedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="border-b border-border">
              <div className="bg-primary/5 px-4 py-2">
                <h4 className="font-medium text-sm text-primary">Crew (Your Configuration)</h4>
              </div>
              <div className="divide-y divide-border">
                {dynamicCrewCosts.map((cost, idx) => (
                  <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                    <span className="text-muted-foreground">{cost.name}</span>
                    <span className="font-medium">{formatCurrency(cost.yearlyEUR)}</span>
                  </div>
                ))}
              </div>
            </div>

            {Object.entries(groupedFixedCosts)
              .filter(([category]) => category !== 'Crew')
              .map(([category, costs]) => (
                <div key={category} className="border-b border-border last:border-b-0">
                  <div className="bg-secondary/30 px-4 py-2">
                    <h4 className="font-medium text-sm">{category}</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {costs.map((cost, idx) => (
                      <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{cost.name}</span>
                          {cost.notes && (
                            <span className="text-xs text-muted-foreground/70 ml-2">({cost.notes})</span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCurrency(cost.yearlyEUR)}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({formatCurrency(cost.monthlyEUR)}/mo)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isVariableOpen} onOpenChange={setIsVariableOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
            <span className="font-medium">Variable Costs Details</span>
            {isVariableOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary/30 px-4 py-2">
              <h4 className="font-medium text-sm">Cost Per Flight Hour</h4>
            </div>
            <div className="divide-y divide-border">
              {aircraft.variableCosts.map((cost, idx) => (
                <div key={idx} className="flex justify-between px-4 py-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{cost.name}</span>
                    {cost.notes && (
                      <span className="text-xs text-muted-foreground/70 ml-2">({cost.notes})</span>
                    )}
                  </div>
                  <span className="font-medium">{formatCurrency(cost.costPerHour)}/hr</span>
                </div>
              ))}
              <div className="flex justify-between px-4 py-3 bg-primary/5">
                <span className="font-medium text-primary">Total Variable Cost</span>
                <span className="font-bold text-primary">
                  {formatCurrency(aircraft.totalVariableCostPerHour)}/hr
                </span>
              </div>
            </div>
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 font-medium">
              ⚠️ Excludes landing, handling, parking, hotels, per diem, and catering. Expect €3,000–6,000 per sector for these costs (outside Bromma).
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={isCharterOpen} onOpenChange={setIsCharterOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
            <span className="font-medium">Charter Economics</span>
            {isCharterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="divide-y divide-border">
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-muted-foreground">Charter Price</span>
                <span className="font-medium">{formatCurrency(aircraft.charterPricePerHour)}/hr</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-muted-foreground">Variable Cost</span>
                <span className="font-medium">-{formatCurrency(aircraft.totalVariableCostPerHour)}/hr</span>
              </div>
              <div className="flex justify-between px-4 py-3 bg-green-50 dark:bg-green-950/30">
                <span className="font-medium text-green-700 dark:text-green-300">Contribution Margin</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(aircraft.contributionMarginPerHour)}/hr
                </span>
              </div>
            </div>
            <div className="px-4 py-3 bg-secondary/30 text-xs text-muted-foreground">
              The contribution margin is the amount each charter hour contributes to offsetting your fixed costs.
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="bg-card rounded-lg border border-border p-4 mt-4">
        <h4 className="font-medium text-sm mb-3">Aircraft Specifications</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Exchange Rate</span>
            <p className="font-medium">{aircraft.exchangeRateUSDEUR} USD/EUR</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fuel Price</span>
            <p className="font-medium">€{aircraft.fuelPricePerLiter}/L</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fuel Consumption</span>
            <p className="font-medium">{aircraft.fuelConsumptionPerHour.toLocaleString()} L/hr</p>
          </div>
          <div>
            <span className="text-muted-foreground">Budget Year</span>
            <p className="font-medium">{aircraft.year}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
