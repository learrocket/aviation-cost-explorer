import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/data/aircraftData';
import { Users, Clock, PlaneTakeoff, User, HelpCircle, TrendingDown, Home, UserCheck, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OwnershipSimpleProps {
  owners: number;
  ownerHours: number[];
  charterHours: number;
  charterMarginPerHour?: number;
  charterPricePerHour?: number;
  includeHangar: boolean;
  cabinCrew: number;
  cabinCrewPolicy: string;
  warrantyAvailable?: boolean;
  inWarranty?: boolean;
  onOwnersChange: (value: number) => void;
  onOwnerHoursChange: (index: number, value: number) => void;
  onCharterHoursChange: (value: number) => void;
  onIncludeHangarChange: (value: boolean) => void;
  onCabinCrewChange: (value: number) => void;
  onInWarrantyChange?: (value: boolean) => void;
}

export const OwnershipSimple = ({
  owners,
  ownerHours,
  charterHours,
  charterMarginPerHour = 0,
  charterPricePerHour = 0,
  includeHangar,
  cabinCrew,
  cabinCrewPolicy,
  warrantyAvailable = false,
  inWarranty = false,
  onOwnersChange,
  onOwnerHoursChange,
  onCharterHoursChange,
  onIncludeHangarChange,
  onCabinCrewChange,
  onInWarrantyChange,
}: OwnershipSimpleProps) => {
  const totalOwnerHours = ownerHours.reduce((sum, h) => sum + h, 0);
  const totalHours = totalOwnerHours + charterHours;
  const charterSavings = charterMarginPerHour * charterHours;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-lg font-semibold text-foreground">How many owners?</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Sharing ownership splits the fixed costs equally between all owners. Each owner pays for their own flying hours separately.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="bg-secondary/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold text-foreground">{owners}</span>
              <span className="text-muted-foreground">{owners === 1 ? 'owner' : 'owners'}</span>
            </div>
          </div>
          <Slider
            value={[owners]}
            onValueChange={(v) => onOwnersChange(v[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground mt-3">
            {owners === 1 
              ? "You'll pay 100% of fixed costs"
              : `Fixed costs split ${owners} ways = ${Math.round(100/owners)}% each`
            }
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h3 className="text-lg font-semibold text-foreground">How much will you fly?</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Each hour you fly adds variable costs such as fuel, fees, and maintenance. This is charged based on actual usage.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="bg-secondary/30 rounded-xl p-6 space-y-4">
          {ownerHours.map((hours, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {owners === 1 ? 'Your flying hours' : `Owner ${index + 1}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">{hours}</span>
                  <span className="text-muted-foreground ml-1">hrs/year</span>
                </div>
              </div>
              <Slider
                value={[hours]}
                onValueChange={(v) => onOwnerHoursChange(index, v[0])}
                min={0}
                max={400}
                step={10}
                className="w-full"
              />
            </div>
          ))}
          
          {owners > 1 && (
            <div className="bg-background rounded-lg p-3 mt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total owner hours</span>
                <span className="font-semibold text-foreground">{totalOwnerHours} hrs/year</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Options */}
      <div className="bg-secondary/30 rounded-xl p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Hangar</span>
          <Switch
            checked={includeHangar}
            onCheckedChange={onIncludeHangarChange}
            className="scale-90"
          />
        </div>
        {warrantyAvailable && onInWarrantyChange && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">In warranty</span>
              <Switch
                checked={inWarranty}
                onCheckedChange={onInWarrantyChange}
                className="scale-90"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>New airframes are typically covered for the first 2–5 years. While in warranty, engine, parts and airframe maintenance reserves are reduced.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </>
        )}
        {cabinCrewPolicy !== 'none' && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Cabin crew</span>
              <div className="flex rounded-md border border-border overflow-hidden">
                {[0, 1, 2].map(n => (
                  <button
                    key={n}
                    onClick={() => onCabinCrewChange(n)}
                    className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                      cabinCrew === n
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h3 className="text-lg font-semibold text-foreground">Charter to reduce costs?</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>When your aircraft is idle, it can fly charter clients. The profit from each charter hour directly reduces your ownership costs.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-xl p-6 border border-green-200/50 dark:border-green-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <PlaneTakeoff className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-foreground">{charterHours}</span>
              <span className="text-muted-foreground">charter hrs/year</span>
            </div>
          </div>
          <Slider
            value={[charterHours]}
            onValueChange={(v) => onCharterHoursChange(v[0])}
            min={0}
            max={400}
            step={10}
            className="w-full"
          />
          <p className="text-sm text-green-700 dark:text-green-300 mt-3">
            {charterHours === 0 
              ? "No charter = you pay full costs"
              : `${charterHours} charter hours generates revenue to offset your costs`
            }
          </p>
          {charterHours > 0 && charterMarginPerHour > 0 && (
            <div className="mt-4 bg-primary/5 rounded-lg p-3 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Charter savings</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-lg font-bold text-primary">{formatCurrency(charterSavings)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({charterHours} hrs × {formatCurrency(charterMarginPerHour)} margin)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Total Aircraft Hours</p>
            <p className="text-lg font-bold text-foreground">{totalHours} hrs/year</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">Owner Hours</p>
            <p className="text-lg font-semibold text-foreground">{totalOwnerHours}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Charter Hours</p>
            <p className="text-lg font-semibold text-green-600">{charterHours}</p>
          </div>
          {totalHours > 400 && (
            <>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">⚠️ Extra crew required</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">Above 400h/year</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
