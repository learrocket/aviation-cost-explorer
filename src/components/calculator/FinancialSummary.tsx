import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { TrendingDown, TrendingUp, Calculator, Wallet, PiggyBank, Users, User } from 'lucide-react';

interface FinancialSummaryProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
  owners: number;
  ownerHours: number[];
  charterHours: number;
}

export const FinancialSummary = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  owners,
  ownerHours,
  charterHours,
}: FinancialSummaryProps) => {
  const crewCosts = 
    (aircraft.crewCosts.captainTotal * captains) +
    (aircraft.crewCosts.firstOfficerTotal * firstOfficers) +
    (aircraft.crewCosts.cabinCrewTotal * cabinCrew) +
    (aircraft.crewCosts.flightEngineerTotal * flightEngineers);

  const nonCrewFixedCosts = aircraft.fixedCosts
    .filter(cost => cost.category !== 'Crew')
    .reduce((sum, cost) => sum + cost.yearlyEUR, 0);

  const totalFixedCosts = crewCosts + nonCrewFixedCosts;
  const totalOwnerHours = ownerHours.reduce((sum, h) => sum + h, 0);
  const totalVariableCosts = aircraft.totalVariableCostPerHour * totalOwnerHours;
  const charterRevenue = aircraft.contributionMarginPerHour * charterHours;
  const grossAnnualCost = totalFixedCosts + totalVariableCosts;
  const netAnnualCost = grossAnnualCost - charterRevenue;
  const fixedCostPerOwner = totalFixedCosts / owners;
  
  const ownerCostBreakdown = ownerHours.map((hours, index) => {
    const ownerVariableCost = aircraft.totalVariableCostPerHour * hours;
    const ownerCharterShare = charterRevenue / owners;
    const ownerTotalCost = fixedCostPerOwner + ownerVariableCost - ownerCharterShare;
    return { index, hours, fixedCost: fixedCostPerOwner, variableCost: ownerVariableCost, charterShare: ownerCharterShare, totalCost: ownerTotalCost };
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        Financial Summary
      </h3>

      <div className="grid gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-chart-1/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fixed Costs</p>
                <p className="text-xs text-muted-foreground">Annual (split equally)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalFixedCosts)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(totalFixedCosts / 12)}/month</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Flying Costs</p>
                <p className="text-xs text-muted-foreground">{totalOwnerHours} hours × €{aircraft.totalVariableCostPerHour.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalVariableCosts)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(aircraft.totalVariableCostPerHour)}/hour</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Charter Revenue</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {charterHours} hrs × €{aircraft.contributionMarginPerHour.toLocaleString()} margin
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">-{formatCurrency(charterRevenue)}</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Charter price: €{aircraft.charterPricePerHour.toLocaleString()}/hr
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border my-2" />

        <div className="bg-primary/5 rounded-lg p-4 border-2 border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Net Annual Cost</p>
                <p className="text-xs text-muted-foreground">After charter revenue offset</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatCurrency(netAnnualCost)}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(netAnnualCost / 12)}/month</p>
            </div>
          </div>
        </div>

        {owners > 1 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Cost Per Owner Breakdown
            </h4>
            {ownerCostBreakdown.map((owner) => (
              <div key={owner.index} className="bg-card rounded-lg p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Owner {owner.index + 1}</p>
                      <p className="text-xs text-muted-foreground">{owner.hours} flying hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatCurrency(owner.totalCost)}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(owner.totalCost / 12)}/month</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-secondary/50 rounded p-2">
                    <p className="text-muted-foreground">Fixed Share</p>
                    <p className="font-medium">{formatCurrency(owner.fixedCost)}</p>
                  </div>
                  <div className="bg-secondary/50 rounded p-2">
                    <p className="text-muted-foreground">Variable</p>
                    <p className="font-medium">{formatCurrency(owner.variableCost)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                    <p className="text-green-600 dark:text-green-400">Charter Share</p>
                    <p className="font-medium text-green-600 dark:text-green-400">-{formatCurrency(owner.charterShare)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Annual Cost</p>
                  <p className="text-xs text-muted-foreground">{ownerHours[0]} flying hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">{formatCurrency(netAnnualCost)}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(netAnnualCost / 12)}/month</p>
              </div>
            </div>
          </div>
        )}

        {owners === 1 && ownerHours[0] > 0 && (
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Effective Cost Per Flight Hour</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(netAnnualCost / ownerHours[0])}/hour
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your total annual cost divided by your {ownerHours[0]} flying hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
