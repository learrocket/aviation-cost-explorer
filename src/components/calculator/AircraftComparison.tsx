import { useState } from 'react';
import { aircraftDatabase, type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { ComparisonPdfExport } from './ComparisonPdfExport';
import { calculateDefaultComparisonCosts } from '@/lib/aircraftCosts';

interface AircraftComparisonProps {
  charterHours: number;
  ownerHours: number;
}

export const AircraftComparison = ({ charterHours, ownerHours }: AircraftComparisonProps) => {
  const [aircraft1Id, setAircraft1Id] = useState<string>(aircraftDatabase[0]?.id || '');
  const [aircraft2Id, setAircraft2Id] = useState<string>(aircraftDatabase[1]?.id || '');
  
  const aircraft1 = aircraftDatabase.find(a => a.id === aircraft1Id);
  const aircraft2 = aircraftDatabase.find(a => a.id === aircraft2Id);
  
  if (!aircraft1 || !aircraft2) return null;
  
  const costs1Base = calculateDefaultComparisonCosts({ aircraft: aircraft1, ownerHours, charterHours });
  const costs2Base = calculateDefaultComparisonCosts({ aircraft: aircraft2, ownerHours, charterHours });

  const costs1 = {
    fixedCosts: costs1Base.totalFixedCosts,
    variableCostPerHour: costs1Base.variableCostPerHour,
    charterMargin: costs1Base.charterMargin,
    charterRevenue: costs1Base.charterRevenue,
    netAnnualCost: costs1Base.netAnnualCost,
    fuelConsumption: costs1Base.fuelConsumption,
  };
  const costs2 = {
    fixedCosts: costs2Base.totalFixedCosts,
    variableCostPerHour: costs2Base.variableCostPerHour,
    charterMargin: costs2Base.charterMargin,
    charterRevenue: costs2Base.charterRevenue,
    netAnnualCost: costs2Base.netAnnualCost,
    fuelConsumption: costs2Base.fuelConsumption,
  };
  
  const getBetterIndicator = (val1: number, val2: number, higherIsBetter: boolean = false) => {
    if (val1 === val2) return { better: null, icon: Minus };
    if (higherIsBetter) {
      return val1 > val2 ? { better: 1, icon: TrendingUp } : { better: 2, icon: TrendingUp };
    }
    return val1 < val2 ? { better: 1, icon: TrendingDown } : { better: 2, icon: TrendingDown };
  };
  
  const metrics = [
    { label: 'Fixed Costs (Annual)', val1: costs1.fixedCosts, val2: costs2.fixedCosts, format: (v: number) => formatCurrency(v), better: getBetterIndicator(costs1.fixedCosts, costs2.fixedCosts) },
    { label: 'Variable Cost/Hour', val1: costs1.variableCostPerHour, val2: costs2.variableCostPerHour, format: (v: number) => formatCurrency(v), better: getBetterIndicator(costs1.variableCostPerHour, costs2.variableCostPerHour) },
    { label: 'Fuel Consumption', val1: costs1.fuelConsumption, val2: costs2.fuelConsumption, format: (v: number) => `${v.toLocaleString()} L/hr`, better: getBetterIndicator(costs1.fuelConsumption, costs2.fuelConsumption) },
    { label: 'Charter Margin/Hour', val1: costs1.charterMargin, val2: costs2.charterMargin, format: (v: number) => formatCurrency(v), better: getBetterIndicator(costs1.charterMargin, costs2.charterMargin, true) },
    { label: `Charter Revenue (${charterHours}h)`, val1: costs1.charterRevenue, val2: costs2.charterRevenue, format: (v: number) => formatCurrency(v), better: getBetterIndicator(costs1.charterRevenue, costs2.charterRevenue, true) },
    { label: 'Net Annual Cost', val1: costs1.netAnnualCost, val2: costs2.netAnnualCost, format: (v: number) => formatCurrency(v), better: getBetterIndicator(costs1.netAnnualCost, costs2.netAnnualCost), highlight: true },
  ];
  
  const savings = Math.abs(costs1.netAnnualCost - costs2.netAnnualCost);
  const cheaperAircraft = costs1.netAnnualCost < costs2.netAnnualCost ? aircraft1 : aircraft2;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Aircraft Comparison</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {ownerHours + charterHours} total hours/year
            </Badge>
            <ComparisonPdfExport
              aircraft1={aircraft1}
              aircraft2={aircraft2}
              ownerHours={ownerHours}
              charterHours={charterHours}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Aircraft 1</label>
            <Select value={aircraft1Id} onValueChange={setAircraft1Id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {aircraftDatabase.map(aircraft => (
                  <SelectItem key={aircraft.id} value={aircraft.id} disabled={aircraft.id === aircraft2Id}>
                    {aircraft.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Aircraft 2</label>
            <Select value={aircraft2Id} onValueChange={setAircraft2Id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {aircraftDatabase.map(aircraft => (
                  <SelectItem key={aircraft.id} value={aircraft.id} disabled={aircraft.id === aircraft1Id}>
                    {aircraft.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Metric</th>
                <th className="text-right py-2 font-medium">{aircraft1.model}</th>
                <th className="text-right py-2 font-medium">{aircraft2.model}</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index} className={`border-b last:border-0 ${metric.highlight ? 'bg-muted/50 font-semibold' : ''}`}>
                  <td className="py-3 text-muted-foreground">{metric.label}</td>
                  <td className={`py-3 text-right ${metric.better.better === 1 ? 'text-green-600 font-medium' : ''}`}>
                    <div className="flex items-center justify-end gap-1">
                      {metric.format(metric.val1)}
                      {metric.better.better === 1 && <Check className="w-4 h-4" />}
                    </div>
                  </td>
                  <td className={`py-3 text-right ${metric.better.better === 2 ? 'text-green-600 font-medium' : ''}`}>
                    <div className="flex items-center justify-end gap-1">
                      {metric.format(metric.val2)}
                      {metric.better.better === 2 && <Check className="w-4 h-4" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <p className="text-sm text-center">
            <span className="font-semibold text-primary">{cheaperAircraft.model}</span>
            {' '}saves you{' '}
            <span className="font-semibold text-green-600">{formatCurrency(savings)}/year</span>
            {' '}based on your usage profile
          </p>
        </div>

        <p className="text-xs text-amber-700 dark:text-amber-400 text-center font-medium">
          ⚠️ Excludes landing, handling, parking, hotels, per diem, and catering (approx. €3,000–6,000/sector outside Bromma).
        </p>
      </CardContent>
    </Card>
  );
};
