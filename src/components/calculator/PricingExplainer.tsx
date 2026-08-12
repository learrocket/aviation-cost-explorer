import { useMemo } from 'react';
import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PricingExplainerProps {
  aircraft: AircraftBudget;
}

/**
 * Explains hour-band pricing for programs (Engine, SmartParts) that have an
 * annual minimum. Below the minimum you pay a flat charge; above it you pay
 * per hour. Renders one small chart per program so non-experts can see the
 * shape at a glance.
 */
export const PricingExplainer = ({ aircraft }: PricingExplainerProps) => {
  const programs = useMemo(
    () =>
      aircraft.variableCosts.filter(
        (c) => typeof c.minHoursPerYear === 'number' && typeof c.annualMinimumEUR === 'number'
      ),
    [aircraft]
  );

  if (programs.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="bg-primary/5 px-4 py-3 border-b border-border">
        <h4 className="font-medium text-sm text-primary flex items-center gap-2">
          <Info className="w-4 h-4" />
          How maintenance-program pricing works
        </h4>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Engine and parts programs are billed in two bands: below the annual minimum you pay a
          flat minimum charge no matter how little you fly; above it you pay the per-hour rate for
          every extra hour. The minimums below are the annual floor for this airframe.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {programs.map((p) => (
          <ProgramCard key={p.name} program={p} />
        ))}
      </div>

      <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 text-[11px] text-amber-800 dark:text-amber-300">
        Rates and minimums vary by aircraft age, engine cycles, and specific program contract.
        Figures shown are indicative for the selected model.
      </div>
    </div>
  );
};

const ProgramCard = ({ program }: { program: AircraftBudget['variableCosts'][number] }) => {
  const minH = program.minHoursPerYear!;
  const rate = program.ratePerHourEUR ?? program.costPerHour;
  const annualMin = program.annualMinimumEUR!;

  // Build a two-band curve: flat until minH, then linear.
  const maxH = Math.max(minH * 2, minH + 200);
  const data = useMemo(() => {
    const points: { hours: number; cost: number }[] = [];
    const step = Math.max(10, Math.round(maxH / 20));
    for (let h = 0; h <= maxH; h += step) {
      points.push({
        hours: h,
        cost: h <= minH ? annualMin : annualMin + (h - minH) * rate,
      });
    }
    if (points[points.length - 1].hours !== maxH) {
      points.push({ hours: maxH, cost: annualMin + (maxH - minH) * rate });
    }
    return points;
  }, [minH, rate, annualMin, maxH]);

  return (
    <div className="p-4 space-y-3">
      <div>
        <div className="text-sm font-medium">{program.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Minimum {minH} h/year • {formatCurrency(rate)}/hr above minimum
        </div>
      </div>

      <div className="rounded-md bg-primary/5 border border-primary/10 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Annual minimum charge
        </div>
        <div className="text-lg font-semibold text-primary">{formatCurrency(annualMin)}</div>
        <div className="text-[11px] text-muted-foreground">
          Paid even if you fly {'<'} {minH} h/year
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
            <XAxis
              dataKey="hours"
              type="number"
              domain={[0, maxH]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${v}h`}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(value: number) => [formatCurrency(value), 'Annual cost']}
              labelFormatter={(label) => `${label} flight hours/yr`}
            />
            <ReferenceLine
              x={minH}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              label={{
                value: `min ${minH}h`,
                position: 'top',
                fontSize: 10,
                fill: 'hsl(var(--primary))',
              }}
            />
            <Line
              type="linear"
              dataKey="cost"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <ReferenceDot
              x={minH}
              y={annualMin}
              r={4}
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};