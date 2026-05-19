import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info, TrendingDown, Target, Lightbulb, Minus, Equal } from 'lucide-react';

interface CharterExplanationProps {
  aircraft: AircraftBudget;
  totalFixedCosts: number;
  totalOwnerHours: number;
  charterHours: number;
}

export const CharterExplanation = ({
  aircraft,
  totalFixedCosts,
  totalOwnerHours,
  charterHours,
}: CharterExplanationProps) => {
  const hoursToBreakEven = totalFixedCosts / aircraft.contributionMarginPerHour;
  const isBreakEvenPossible = hoursToBreakEven <= 600;
  
  const baseOwnerCosts = totalFixedCosts + (aircraft.totalVariableCostPerHour * totalOwnerHours);
  
  const chartData = [];
  const maxChartHours = Math.min(Math.max(400, charterHours + 100), 600);
  
  for (let hours = 0; hours <= maxChartHours; hours += 25) {
    const charterRevenue = aircraft.contributionMarginPerHour * hours;
    const netCost = baseOwnerCosts - charterRevenue;
    
    chartData.push({
      hours,
      netCost: Math.max(0, Math.round(netCost)),
      label: `${hours}h`,
    });
  }

  const currentCharterRevenue = aircraft.contributionMarginPerHour * charterHours;
  const currentNetCost = baseOwnerCosts - currentCharterRevenue;
  const costWithoutCharter = baseOwnerCosts;
  const savingsFromCharter = costWithoutCharter - currentNetCost;

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    return `€${(value / 1000).toFixed(0)}K`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.hours} charter hours</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">Your net annual cost</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-900">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
              Why Charter Your Aircraft?
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              When you're not using your aircraft, it can generate revenue by flying charter clients. 
              This income directly reduces your ownership costs.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-4">
          <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 text-center flex-1 w-full sm:w-auto">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Charter Price</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(aircraft.charterPricePerHour)}/hr
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Excl. landing & handling</p>
          </div>
          
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex-shrink-0">
            <Minus className="w-5 h-5 text-green-700 dark:text-green-300" />
          </div>
          
          <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 text-center flex-1 w-full sm:w-auto">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Operating Cost</p>
            <p className="text-xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(aircraft.totalVariableCostPerHour)}/hr
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Fuel, fees, maintenance</p>
          </div>
          
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex-shrink-0">
            <Equal className="w-5 h-5 text-green-700 dark:text-green-300" />
          </div>
          
          <div className="bg-green-200/80 dark:bg-green-800/50 rounded-lg p-4 text-center flex-1 w-full sm:w-auto border-2 border-green-400 dark:border-green-600">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold mb-1">Charter Profit</p>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {formatCurrency(aircraft.contributionMarginPerHour)}/hr
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">Your earnings</p>
          </div>
        </div>
      </div>

      {charterHours > 0 && (
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <span className="font-medium">Your Charter Savings</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(savingsFromCharter)}
            </span>
            <span className="text-sm text-muted-foreground">
              saved annually ({charterHours} hrs × {formatCurrency(aircraft.contributionMarginPerHour)}/hr margin at {formatCurrency(aircraft.charterPricePerHour)}/hr charter rate)
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">Cost Reduction by Charter Hours</h4>
        </div>
        
        <p className="text-sm text-muted-foreground">
          This chart shows how your annual cost decreases as you add more charter hours. 
          The more you charter, the lower your net cost.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="hours" 
                label={{ value: 'Charter Hours', position: 'bottom', offset: 0 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                label={{ value: 'Net Annual Cost', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="netCost" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
              <ReferenceLine 
                x={charterHours} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="5 5"
                label={{ 
                  value: 'You', 
                  position: 'top',
                  fill: 'hsl(var(--primary))',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">How charter offsets your costs: </span>
            Every charter hour contributes <span className="font-semibold text-primary">{formatCurrency(aircraft.contributionMarginPerHour)}</span> towards 
            reducing your annual ownership costs. Charter revenue won't cover all fixed costs, but it meaningfully 
            lowers your effective cost per flight hour.
          </div>
        </div>
      </div>
    </div>
  );
};
