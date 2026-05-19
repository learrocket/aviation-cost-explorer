import { formatCurrency } from '@/data/aircraftData';
import { Slider } from '@/components/ui/slider';
import { TrendingDown, Calculator, BadgePercent, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export type TaxJurisdiction = 'sweden' | 'us' | 'manual';

export const TAX_PRESETS: Record<Exclude<TaxJurisdiction, 'manual'>, { label: string; rate: number; description: string }> = {
  sweden: { label: '🇸🇪 Sweden', rate: 20.6, description: 'Bolagsskatt 20.6%' },
  us: { label: '🇺🇸 United States', rate: 21, description: 'Federal corporate tax 21%' },
};

interface DepreciationModuleProps {
  owners: number;
  purchasePrice: number;
  depreciationYears: number;
  estimatedResaleDecline: number;
  jurisdiction: TaxJurisdiction;
  manualRate: number;
  onPurchasePriceChange: (v: number) => void;
  onDepreciationYearsChange: (v: number) => void;
  onEstimatedResaleDeclineChange: (v: number) => void;
  onJurisdictionChange: (v: TaxJurisdiction) => void;
  onManualRateChange: (v: number) => void;
}

export const DepreciationModule = ({
  owners,
  purchasePrice,
  depreciationYears,
  estimatedResaleDecline,
  jurisdiction,
  manualRate,
  onPurchasePriceChange,
  onDepreciationYearsChange,
  onEstimatedResaleDeclineChange,
  onJurisdictionChange,
  onManualRateChange,
}: DepreciationModuleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const taxRate = jurisdiction === 'manual' 
    ? manualRate / 100 
    : TAX_PRESETS[jurisdiction].rate / 100;

  const taxLabel = jurisdiction === 'manual'
    ? `${manualRate}%`
    : `${TAX_PRESETS[jurisdiction].rate}%`;

  const annualDepreciation = purchasePrice / depreciationYears;
  const annualTaxSaving = annualDepreciation * taxRate;
  const totalTaxSaving = annualTaxSaving * depreciationYears;
  const estimatedResaleValue = purchasePrice * (1 - estimatedResaleDecline / 100);
  // After full depreciation period, book value is 0
  const bookValueAtSale = depreciationYears >= 10 ? 0 : purchasePrice - (annualDepreciation * Math.min(depreciationYears, 10));
  // Depreciation recapture: taxable gain on sale = sale price - book value
  const taxableGainOnSale = Math.max(estimatedResaleValue - bookValueAtSale, 0);
  const recaptureTax = taxableGainOnSale * taxRate;
  // Net tax benefit = total deductions saved minus recapture tax owed at sale
  const netTaxBenefit = totalTaxSaving - recaptureTax || 0; // avoid -0
  const annualTaxSavingPerOwner = annualTaxSaving / Math.max(owners, 1);
  const purchasePricePerOwner = purchasePrice / Math.max(owners, 1);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center">
          <TrendingDown className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Investment & Depreciation</h2>
          <p className="text-sm text-muted-foreground">Tax benefits of aircraft ownership</p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-8">
        {/* Tax Jurisdiction Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Tax Jurisdiction
          </label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(TAX_PRESETS) as [Exclude<TaxJurisdiction, 'manual'>, typeof TAX_PRESETS[keyof typeof TAX_PRESETS]][]).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => onJurisdictionChange(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  jurisdiction === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/30 text-foreground border-border hover:border-primary/50'
                }`}
              >
                {preset.label} ({preset.rate}%)
              </button>
            ))}
            <button
              onClick={() => onJurisdictionChange('manual')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                jurisdiction === 'manual'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/30 text-foreground border-border hover:border-primary/50'
              }`}
            >
              ✏️ Custom Rate
            </button>
          </div>
          {jurisdiction === 'manual' && (
            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Corporate Tax Rate</span>
                <span className="text-lg font-bold text-foreground">{manualRate}%</span>
              </div>
              <Slider
                value={[manualRate]}
                onValueChange={([v]) => onManualRateChange(v)}
                min={5}
                max={50}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Purchase Price
            </label>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(purchasePrice)}
            </div>
            <Slider
              value={[purchasePrice]}
              onValueChange={([v]) => onPurchasePriceChange(v)}
              min={5_000_000}
              max={20_000_000}
              step={500_000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€5M</span>
              <span>€20M</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Depreciation Period
            </label>
            <div className="text-2xl font-bold text-foreground">
              {depreciationYears} years
            </div>
            <Slider
              value={[depreciationYears]}
              onValueChange={([v]) => onDepreciationYearsChange(v)}
              min={3}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 yr</span>
              <span>10 yr</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Est. Market Value Decline (10 yr)
            </label>
            <div className="text-2xl font-bold text-foreground">
              {estimatedResaleDecline}%
            </div>
            <Slider
              value={[estimatedResaleDecline]}
              onValueChange={([v]) => onEstimatedResaleDeclineChange(v)}
              min={0}
              max={50}
              step={5}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        {/* Hero Results */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl p-6 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-2">
              <BadgePercent className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Annual Tax Deduction
              </span>
            </div>
            <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
              {formatCurrency(annualDepreciation)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              per year for {depreciationYears} years (straight-line)
            </p>
            {owners > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(annualDepreciation / owners)} per owner
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Annual Tax Saving ({taxLabel})
              </span>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(annualTaxSaving)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              reduced corporate tax per year
            </p>
            {owners > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(annualTaxSavingPerOwner)} per owner
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-muted-foreground">
                Est. Resale Value (10 yr)
              </span>
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(estimatedResaleValue)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {estimatedResaleDecline}% decline from {formatCurrency(purchasePrice)}
            </p>
            {owners > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatCurrency(estimatedResaleValue / owners)} per owner
              </p>
            )}
          </div>
        </div>

        {/* Summary breakdown */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-auto py-3 px-4">
              <span className="font-medium">Detailed Investment Summary</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-secondary/30 rounded-xl p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Purchase price{owners > 1 ? ` (${owners} owners)` : ''}</span>
                <span className="font-medium">
                  {formatCurrency(purchasePrice)}
                  {owners > 1 && (
                    <span className="text-muted-foreground ml-2">
                      ({formatCurrency(purchasePricePerOwner)} each)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Annual depreciation (straight-line over {depreciationYears} yr)</span>
                <span className="font-medium">{formatCurrency(annualDepreciation)}/yr</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Annual tax saving ({taxLabel} corporate tax)</span>
                <span className="font-medium">{formatCurrency(annualTaxSaving)}/yr</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Total tax saving over {depreciationYears} years</span>
                <span className="font-medium">{formatCurrency(totalTaxSaving)}</span>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <p className="font-medium text-foreground mb-2">Exit Scenario (after {depreciationYears}+ years)</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Book value after depreciation</span>
                  <span className="font-medium">{formatCurrency(Math.max(bookValueAtSale, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated market value at sale</span>
                  <span className="font-medium">{formatCurrency(estimatedResaleValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxable gain on sale (recapture)</span>
                  <span className="font-medium">{formatCurrency(taxableGainOnSale)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Recapture tax owed ({taxLabel})</span>
                  <span className="font-medium">- {formatCurrency(recaptureTax)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                <p className="font-medium text-foreground mb-2">Net Tax Position</p>
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Total tax saved during ownership</span>
                  <span className="font-medium">{formatCurrency(totalTaxSaving)}</span>
                </div>
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Less: recapture tax at sale</span>
                  <span className="font-medium">- {formatCurrency(recaptureTax)}</span>
                </div>
                <div className="flex justify-between mt-2 text-primary font-bold">
                  <span>Net tax benefit</span>
                  <span>{formatCurrency(netTaxBenefit)}</span>
                </div>
                {owners > 1 && (
                  <div className="flex justify-between text-muted-foreground text-xs mt-1">
                    <span>Per owner</span>
                    <span>{formatCurrency(netTaxBenefit / owners)}</span>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-3">
          <p>
            <strong>Note:</strong> This is a simplified illustration using straight-line depreciation. 
            Actual tax treatment depends on ownership structure, jurisdiction, accounting method, 
            and individual circumstances. Consult your tax advisor for precise calculations.
          </p>
        </div>
      </div>
    </section>
  );
};
