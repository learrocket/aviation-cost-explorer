import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface CostChartProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
  flyingHours: number;
  charterHours: number;
}

export const CostChart = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  flyingHours,
  charterHours,
}: CostChartProps) => {
  const crewCosts = 
    (aircraft.crewCosts.captainTotal * captains) +
    (aircraft.crewCosts.firstOfficerTotal * firstOfficers) +
    (aircraft.crewCosts.cabinCrewTotal * cabinCrew) +
    (aircraft.crewCosts.flightEngineerTotal * flightEngineers);

  const nonCrewFixedCosts = aircraft.fixedCosts
    .filter(cost => cost.category !== 'Crew')
    .reduce((sum, cost) => sum + cost.yearlyEUR, 0);

  const totalFixedCosts = crewCosts + nonCrewFixedCosts;
  const totalHours = flyingHours + charterHours;
  const totalVariableCosts = aircraft.totalVariableCostPerHour * totalHours;
  const charterRevenue = aircraft.contributionMarginPerHour * charterHours;
  const grossCost = totalFixedCosts + totalVariableCosts;
  const netCost = grossCost - charterRevenue;

  const barData = [
    {
      name: 'Gross Cost',
      fixed: totalFixedCosts / 1000000,
      variable: totalVariableCosts / 1000000,
      net: 0,
      savings: 0,
    },
    {
      name: 'Net Cost',
      fixed: 0,
      variable: 0,
      net: netCost / 1000000,
      savings: charterRevenue / 1000000,
    },
  ];

  const pieData = [
    { name: 'Crew Costs', value: crewCosts, fill: 'hsl(var(--chart-1))' },
    { name: 'Operations', value: nonCrewFixedCosts, fill: 'hsl(var(--chart-2))' },
    { name: 'Variable', value: totalVariableCosts, fill: 'hsl(var(--chart-3))' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: €{(entry.value * 1000000).toLocaleString('de-DE', { maximumFractionDigits: 0 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 relative z-0">
      <h3 className="text-lg font-semibold text-foreground">Cost Visualization</h3>

      <div className="bg-card rounded-lg border border-border p-4 overflow-hidden">
        <h4 className="text-sm font-medium mb-4">Gross vs Net Annual Cost</h4>
        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical">
              <XAxis 
                type="number" 
                tickFormatter={(value) => `€${value}M`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="fixed" stackId="a" fill="hsl(var(--chart-1))" name="Fixed Costs" />
              <Bar dataKey="variable" stackId="a" fill="hsl(var(--chart-2))" name="Variable Costs" />
              <Bar dataKey="net" stackId="b" fill="hsl(var(--primary))" name="Net Cost" />
              <Bar dataKey="savings" stackId="b" fill="hsl(142 76% 36%)" name="Charter Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span>Fixed Costs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span>Variable Costs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(142 76% 36%)' }} />
            <span>Charter Revenue</span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="text-sm font-medium mb-4">Cost Category Breakdown</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {charterHours > 0 && (
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900 p-4">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
            Charter Revenue Impact
          </h4>
          <p className="text-sm text-green-600 dark:text-green-400">
            By chartering {charterHours} hours at €{aircraft.charterPricePerHour.toLocaleString()}/hr, 
            you offset <strong>{formatCurrency(charterRevenue)}</strong> of your annual costs, 
            reducing ownership expenses by <strong>{((charterRevenue / grossCost) * 100).toFixed(1)}%</strong>.
          </p>
        </div>
      )}
    </div>
  );
};
