import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { TrendingDown, Wallet, User, Users, ArrowRight, Sparkles } from 'lucide-react';
import { calculateAnnualAircraftCosts } from '@/lib/aircraftCosts';

interface ResultsSummaryProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
  owners: number;
  ownerHours: number[];
  charterHours: number;
  crewAutoAdjusted?: boolean;
  totalHours?: number;
}

export const ResultsSummary = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  owners,
  ownerHours,
  charterHours,
  crewAutoAdjusted,
  totalHours,
}: ResultsSummaryProps) => {
  const {
    totalFixedCosts,
    totalOwnerHours,
    ownerVariableCosts,
    charterRevenue,
    netAnnualCost,
    ownerCostBreakdown,
  } = calculateAnnualAircraftCosts({
    aircraft,
    captains,
    firstOfficers,
    cabinCrew,
    flightEngineers,
    owners,
    ownerHours,
    charterHours,
  });

  return (
    <div className="space-y-6">
      {/* Crew auto-adjustment notice */}
      {crewAutoAdjusted && totalHours && totalHours > 400 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            ⚠️ Crew automatically increased for {totalHours} total hours/year
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            When total flying hours exceed 400h/year, an additional First Officer{aircraft.cabinCrewPolicy !== 'none' ? ' and Cabin Crew member are' : ' is'} required to maintain safe crew duty time limits. This is reflected in the fixed costs below.
          </p>
        </div>
      )}

      {/* Hero Result */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border-2 border-primary relative overflow-hidden">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {owners === 1 ? 'Your Annual Cost' : 'Total Annual Cost (All Owners)'}
          </p>
          <p className="text-5xl font-bold text-primary">
            {formatCurrency(netAnnualCost)}
          </p>
          <p className="text-lg text-muted-foreground">
            {formatCurrency(netAnnualCost / 12)} per month
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm flex-wrap">
          <span className="bg-background/80 px-3 py-1 rounded-full">
            <span className="text-muted-foreground">Fixed:</span>{' '}
            <span className="font-semibold">{formatCurrency(totalFixedCosts)}</span>
          </span>
          <span className="text-muted-foreground">+</span>
          <span className="bg-background/80 px-3 py-1 rounded-full">
              <span className="text-muted-foreground">Flying:</span>{' '}
              <span className="font-semibold">{formatCurrency(ownerVariableCosts)}</span>
          </span>
          {charterRevenue > 0 && (
            <>
              <span className="text-muted-foreground">−</span>
              <span className="bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full text-green-700 dark:text-green-300">
                <span>Charter:</span>{' '}
                <span className="font-semibold">{formatCurrency(charterRevenue)}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Excluded costs disclaimer */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300 space-y-1">
        <p className="font-semibold">⚠️ Not included in the calculation:</p>
        <p>
          Landing fees, handling, parking, crew hotels, per diem, and catering are <strong>not included</strong> in these figures.
          Expect approximately <strong>€3,000–6,000 per sector</strong> for these costs (outside of Bromma).
        </p>
      </div>

      {/* Per-Owner Breakdown */}
      {owners > 1 ? (
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            What Each Owner Pays
          </h4>
          
          <div className="grid gap-4">
            {ownerCostBreakdown.map((owner) => (
              <div 
                key={owner.index} 
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Owner {owner.index + 1}</p>
                      <p className="text-sm text-muted-foreground">{owner.hours} flying hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(owner.totalCost)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(owner.totalCost / 12)}/month
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-secondary rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Fixed Share</p>
                    <p className="font-semibold mt-1">{formatCurrency(owner.fixedCost)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 bg-secondary rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">+ Variable</p>
                    <p className="font-semibold mt-1">{formatCurrency(owner.variableCost)}</p>
                  </div>
                  {owner.charterShare > 0 && (
                    <>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 bg-green-50 dark:bg-green-950/30 rounded-lg p-2 text-center">
                        <p className="text-green-600 dark:text-green-400">− Charter</p>
                        <p className="font-semibold text-green-600 dark:text-green-400 mt-1">
                          {formatCurrency(owner.charterShare)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {owner.hours > 0 && (
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Effective cost per flight hour</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(owner.effectiveHourlyCost)}/hr
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Single owner view */
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-semibold">Cost Breakdown</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixed costs (crew, insurance, hangar, etc.)</span>
              <span className="font-medium">{formatCurrency(totalFixedCosts)}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-muted-foreground">Flying costs ({totalOwnerHours} hrs × €{aircraft.totalVariableCostPerHour.toLocaleString()})</span>
               <span className="font-medium">{formatCurrency(ownerVariableCosts)}</span>
            </div>
            {charterRevenue > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Charter revenue ({charterHours} hrs)</span>
                <span className="font-medium">−{formatCurrency(charterRevenue)}</span>
              </div>
            )}
          </div>

          {ownerHours[0] > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Your effective cost per flight hour</p>
                  <p className="text-sm text-muted-foreground">Total cost ÷ {ownerHours[0]} flying hours</p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(netAnnualCost / ownerHours[0])}/hr
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-secondary/30 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          More flying hours reduce your effective hourly cost. Charter revenue directly lowers your annual ownership expense.
        </p>
      </div>
    </div>
  );
};
