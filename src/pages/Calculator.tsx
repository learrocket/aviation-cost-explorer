import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { aircraftDatabase, type AircraftBudget, type DisplayCurrency, setDisplayCurrency } from '@/data/aircraftData';
import { PasswordGate } from '@/components/PasswordGate';
import { AircraftSelector } from '@/components/calculator/AircraftSelector';
import { OwnershipSimple } from '@/components/calculator/OwnershipSimple';
import { ResultsSummary } from '@/components/calculator/ResultsSummary';
import { CharterExplanation } from '@/components/calculator/CharterExplanation';
import { CrewConfiguration } from '@/components/calculator/CrewConfiguration';
import { CostBreakdown } from '@/components/calculator/CostBreakdown';
import { DepreciationModule, type TaxJurisdiction } from '@/components/calculator/DepreciationModule';
import { PdfExport } from '@/components/calculator/PdfExport';
import { AircraftComparison } from '@/components/calculator/AircraftComparison';
import { SHOW_DEPRECIATION } from '@/lib/featureFlags';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings2, ChevronDown, ChevronUp, Info, Scale, Fuel, Globe } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import logo from '@/assets/1903-aviation-logo.png';

const Calculator = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftBudget>(aircraftDatabase[0]);
  
  const [baseCaptains, setBaseCaptains] = useState(aircraftDatabase[0].defaultCrewConfig.captains);
  const [baseFirstOfficers, setBaseFirstOfficers] = useState(aircraftDatabase[0].defaultCrewConfig.firstOfficers);
  const [baseCabinCrew, setBaseCabinCrew] = useState(aircraftDatabase[0].defaultCrewConfig.cabinCrew);
  const [flightEngineers, setFlightEngineers] = useState(aircraftDatabase[0].defaultCrewConfig.flightEngineers);
  
  const [owners, setOwners] = useState(1);
  const [ownerHours, setOwnerHours] = useState<number[]>([200]);
  const [charterHours, setCharterHours] = useState(100);

  // Budget adjustments
  const [includeHangar, setIncludeHangar] = useState(true);
  const [inWarranty, setInWarranty] = useState(false);
  const [fuelPrice, setFuelPrice] = useState(aircraftDatabase[0].fuelPricePerLiter);
  const [currency, setCurrency] = useState<DisplayCurrency>('EUR');
  const [exchangeRates, setExchangeRates] = useState<Record<DisplayCurrency, number>>({ EUR: 1, USD: 1.08, SEK: 11.2 });

  // Depreciation state (lifted)
  const [purchasePrice, setPurchasePrice] = useState(11_000_000);
  const [depreciationYears, setDepreciationYears] = useState(5);
  const [estimatedResaleDecline, setEstimatedResaleDecline] = useState(20);
  const [jurisdiction, setJurisdiction] = useState<TaxJurisdiction>('sweden');
  const [manualRate, setManualRate] = useState(25);

  // Fetch live exchange rates
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      .then(r => r.json())
      .then(data => {
        if (data.rates) {
          setExchangeRates({
            EUR: 1,
            USD: data.rates.USD ?? 1.08,
            SEK: data.rates.SEK ?? 11.2,
          });
        }
      })
      .catch(() => {}); // use defaults on error
  }, []);

  // Sync currency display — must be synchronous (before render) to avoid stale currency symbols
  setDisplayCurrency(currency, exchangeRates);

  // Compute adjusted aircraft based on hangar/fuel overrides
  const adjustedAircraft = useMemo((): AircraftBudget => {
    const fuelDelta = (fuelPrice - selectedAircraft.fuelPricePerLiter) * selectedAircraft.fuelConsumptionPerHour;
    const hangarCost = selectedAircraft.fixedCosts.find(c => c.name === 'Hangar')?.yearlyEUR ?? 0;

    const adjustedFuelCostPerHour = fuelPrice * selectedAircraft.fuelConsumptionPerHour;
    const warrantySavings = inWarranty && selectedAircraft.warrantyAvailable
      ? (selectedAircraft.warrantySavingsPerHour ?? 0)
      : 0;
    const warrantyTargets = new Set([
      'Engine Program (both engines)',
      'SmartParts',
      'SmartParts / EEC',
      'Airframe Maintenance Labour',
      'APU Honeywell',
    ]);
    // Distribute warranty savings proportionally across the covered lines.
    const coveredTotal = selectedAircraft.variableCosts
      .filter(c => warrantyTargets.has(c.name))
      .reduce((s, c) => s + c.costPerHour, 0);
    const adjustedVariableCosts = selectedAircraft.variableCosts.map(c => {
      if (c.name === 'Fuel') {
        return { ...c, costPerHour: adjustedFuelCostPerHour, notes: `${selectedAircraft.fuelConsumptionPerHour.toLocaleString()}L × €${fuelPrice.toFixed(2)}/L` };
      }
      if (warrantySavings > 0 && warrantyTargets.has(c.name) && coveredTotal > 0) {
        const share = c.costPerHour / coveredTotal;
        const reduced = Math.max(0, c.costPerHour - warrantySavings * share);
        return { ...c, costPerHour: reduced, notes: `${c.notes ?? ''}${c.notes ? ' • ' : ''}Warranty applied` };
      }
      return c;
    });

    return {
      ...selectedAircraft,
      fixedCosts: includeHangar
        ? selectedAircraft.fixedCosts
        : selectedAircraft.fixedCosts.filter(c => c.name !== 'Hangar'),
      totalFixedCostsYearly: selectedAircraft.totalFixedCostsYearly - (includeHangar ? 0 : hangarCost),
      variableCosts: adjustedVariableCosts,
      totalVariableCostPerHour: selectedAircraft.totalVariableCostPerHour + fuelDelta - warrantySavings,
      contributionMarginPerHour: selectedAircraft.charterPricePerHour - (selectedAircraft.totalVariableCostPerHour + fuelDelta - warrantySavings),
    };
  }, [selectedAircraft, includeHangar, fuelPrice, inWarranty]);

  const totalOwnerHours = ownerHours.reduce((sum, h) => sum + h, 0);
  const totalHours = totalOwnerHours + charterHours;
  const crewAutoAdjusted = totalHours > 400;

  const captains = baseCaptains;
  const firstOfficers = crewAutoAdjusted ? baseFirstOfficers + 1 : baseFirstOfficers;
  const cabinCrew = crewAutoAdjusted && selectedAircraft.cabinCrewPolicy !== 'none'
    ? baseCabinCrew + 1
    : baseCabinCrew;

  const handleOwnersChange = (newOwnerCount: number) => {
    setOwners(newOwnerCount);
    setOwnerHours(prev => {
      if (newOwnerCount > prev.length) {
        return [...prev, ...Array(newOwnerCount - prev.length).fill(100)];
      } else {
        return prev.slice(0, newOwnerCount);
      }
    });
  };

  const handleOwnerHoursChange = (index: number, hours: number) => {
    setOwnerHours(prev => {
      const updated = [...prev];
      updated[index] = hours;
      return updated;
    });
  };

  const crewCosts = 
    (adjustedAircraft.crewCosts.captainTotal * captains) +
    (adjustedAircraft.crewCosts.firstOfficerTotal * firstOfficers) +
    (adjustedAircraft.crewCosts.cabinCrewTotal * cabinCrew) +
    (adjustedAircraft.crewCosts.flightEngineerTotal * flightEngineers);

  const nonCrewFixedCosts = adjustedAircraft.fixedCosts
    .filter(cost => cost.category !== 'Crew')
    .reduce((sum, cost) => sum + cost.yearlyEUR, 0);

  const totalFixedCosts = crewCosts + nonCrewFixedCosts;

  useEffect(() => {
    const auth = sessionStorage.getItem('1903-authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAircraftSelect = (aircraft: AircraftBudget) => {
    setSelectedAircraft(aircraft);
    setBaseCaptains(aircraft.defaultCrewConfig.captains);
    setBaseFirstOfficers(aircraft.defaultCrewConfig.firstOfficers);
    setBaseCabinCrew(aircraft.defaultCrewConfig.cabinCrew);
    setFlightEngineers(aircraft.defaultCrewConfig.flightEngineers);
    setFuelPrice(aircraft.fuelPricePerLiter);
  };

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1 sm:gap-2 px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <img src={logo} alt="1903 Aviation" className="h-6 sm:h-8" />
            </div>
            
            {/* Settings Bar: Currency & Fuel */}
            <div className="flex items-center gap-2 sm:gap-4 text-sm">
              {/* Currency */}
              <div className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hidden sm:block" />
                <div className="flex rounded-md border border-border overflow-hidden">
                  {(['EUR', 'USD', 'SEK'] as DisplayCurrency[]).map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors ${
                        currency === c 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-5 sm:h-6 w-px bg-border" />

              {/* Fuel Price */}
              <div className="flex items-center gap-1 sm:gap-2">
                <Fuel className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={fuelPrice}
                    onChange={e => setFuelPrice(Math.max(0.5, Math.min(3, parseFloat(e.target.value) || 0)))}
                    step={0.05}
                    min={0.5}
                    max={3}
                    className="w-14 sm:w-16 h-7 rounded border border-border bg-background px-1.5 sm:px-2 text-xs text-center"
                  />
                  <span className="text-xs text-muted-foreground">€/L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Aircraft Ownership Calculator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the true cost of aircraft ownership. Adjust the options below to see 
            how shared ownership and charter operations can reduce your costs.
          </p>
        </div>

        {/* Step 1: Aircraft Selection */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Choose Your Aircraft</h2>
              <p className="text-sm text-muted-foreground">Each aircraft has different operating costs</p>
            </div>
          </div>
          
          <AircraftSelector
            selectedAircraftId={selectedAircraft.id}
            onSelect={handleAircraftSelect}
          />
        </section>

        {/* Step 2: Ownership Configuration */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Configure Your Ownership</h2>
              <p className="text-sm text-muted-foreground">Set up owners, flying hours, and charter preferences</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <OwnershipSimple
              owners={owners}
              ownerHours={ownerHours}
              charterHours={charterHours}
              charterMarginPerHour={adjustedAircraft.contributionMarginPerHour}
              charterPricePerHour={adjustedAircraft.charterPricePerHour}
              includeHangar={includeHangar}
              cabinCrew={baseCabinCrew}
              cabinCrewPolicy={selectedAircraft.cabinCrewPolicy}
              warrantyAvailable={selectedAircraft.warrantyAvailable}
              inWarranty={inWarranty}
              onOwnersChange={handleOwnersChange}
              onOwnerHoursChange={handleOwnerHoursChange}
              onCharterHoursChange={setCharterHours}
              onIncludeHangarChange={setIncludeHangar}
              onCabinCrewChange={setBaseCabinCrew}
              onInWarrantyChange={setInWarranty}
            />
          </div>
        </section>

        {/* Step 3: Results */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Your Costs</h2>
                <p className="text-sm text-muted-foreground">See your estimated annual ownership costs</p>
              </div>
            </div>
            <PdfExport
              aircraft={adjustedAircraft}
              captains={captains}
              firstOfficers={firstOfficers}
              cabinCrew={cabinCrew}
              flightEngineers={flightEngineers}
              owners={owners}
              ownerHours={ownerHours}
              charterHours={charterHours}
              crewAutoAdjusted={crewAutoAdjusted}
              purchasePrice={purchasePrice}
              depreciationYears={depreciationYears}
              estimatedResaleDecline={estimatedResaleDecline}
              jurisdiction={jurisdiction}
              manualRate={manualRate}
            />
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <ResultsSummary
              aircraft={adjustedAircraft}
              captains={captains}
              firstOfficers={firstOfficers}
              cabinCrew={cabinCrew}
              flightEngineers={flightEngineers}
              owners={owners}
              ownerHours={ownerHours}
              charterHours={charterHours}
              crewAutoAdjusted={crewAutoAdjusted}
              totalHours={totalHours}
            />
          </div>
        </section>

        {/* Charter Explanation */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Understanding Charter Revenue</h2>
              <p className="text-sm text-muted-foreground">How chartering reduces your ownership costs</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
            <CharterExplanation
              aircraft={adjustedAircraft}
              totalFixedCosts={totalFixedCosts}
              totalOwnerHours={totalOwnerHours}
              charterHours={charterHours}
            />
          </div>
        </section>

        {/* Depreciation & Investment — temporarily hidden. Flip SHOW_DEPRECIATION to true to re-enable. */}
        {SHOW_DEPRECIATION && (
          <DepreciationModule
            owners={owners}
            purchasePrice={purchasePrice}
            depreciationYears={depreciationYears}
            estimatedResaleDecline={estimatedResaleDecline}
            jurisdiction={jurisdiction}
            manualRate={manualRate}
            onPurchasePriceChange={setPurchasePrice}
            onDepreciationYearsChange={setDepreciationYears}
            onEstimatedResaleDeclineChange={setEstimatedResaleDecline}
            onJurisdictionChange={setJurisdiction}
            onManualRateChange={setManualRate}
          />
        )}

        {/* Aircraft Comparison */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Compare Aircraft</h2>
              <p className="text-sm text-muted-foreground">See how different models compare for your usage</p>
            </div>
          </div>

          <AircraftComparison
            charterHours={charterHours}
            ownerHours={totalOwnerHours}
          />
        </section>

        {/* Advanced Settings */}
        <section className="mb-12">
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-auto py-4 px-6 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium">Advanced Settings</p>
                    <p className="text-sm text-muted-foreground">Crew configuration & detailed cost breakdown</p>
                  </div>
                </div>
                {showAdvanced ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <CrewConfiguration
                    aircraft={adjustedAircraft}
                    captains={captains}
                    firstOfficers={firstOfficers}
                    cabinCrew={cabinCrew}
                    flightEngineers={flightEngineers}
                    onCaptainsChange={setBaseCaptains}
                    onFirstOfficersChange={setBaseFirstOfficers}
                    onCabinCrewChange={setBaseCabinCrew}
                    onFlightEngineersChange={setFlightEngineers}
                  />
                  {crewAutoAdjusted && (
                    <div className="mt-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                      <p className="font-semibold">⚠️ Auto-adjusted for {totalHours}h total/year:</p>
                      <p>+1 First Officer{selectedAircraft.cabinCrewPolicy !== 'none' ? ' and +1 Cabin Crew' : ''} added automatically (duty time limits above 400h/year). The sliders show base crew — the additional crew is added on top.</p>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <CostBreakdown
                    aircraft={adjustedAircraft}
                    captains={captains}
                    firstOfficers={firstOfficers}
                    cabinCrew={cabinCrew}
                    flightEngineers={flightEngineers}
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Disclaimer */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            <strong>Note:</strong> These calculations are estimates based on 2026 budget projections. 
            All prices are excluding VAT. Landing, handling, parking, crew hotels, per diem, and catering 
            are <strong>not included</strong> — expect approximately €3,000–6,000 per sector (outside Bromma).
          </p>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} 1903 Aviation. All budget figures are estimates for 2026.</p>
        </div>
      </footer>
    </div>
  );
};

export default Calculator;
