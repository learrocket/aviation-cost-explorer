import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Clock, PlaneTakeoff, Receipt, User } from 'lucide-react';

interface OwnershipSettingsProps {
  owners: number;
  ownerHours: number[];
  charterHours: number;
  includeVAT: boolean;
  onOwnersChange: (value: number) => void;
  onOwnerHoursChange: (index: number, value: number) => void;
  onCharterHoursChange: (value: number) => void;
  onVATChange: (value: boolean) => void;
}

export const OwnershipSettings = ({
  owners,
  ownerHours,
  charterHours,
  includeVAT,
  onOwnersChange,
  onOwnerHoursChange,
  onCharterHoursChange,
  onVATChange,
}: OwnershipSettingsProps) => {
  const totalOwnerHours = ownerHours.reduce((sum, h) => sum + h, 0);
  const totalHours = totalOwnerHours + charterHours;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Ownership & Flight Hours
      </h3>

      <div className="space-y-5">
        {/* Number of Owners */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Number of Owners
            </label>
            <span className="text-lg font-semibold text-foreground">{owners}</span>
          </div>
          <Slider
            value={[owners]}
            onValueChange={(v) => onOwnersChange(v[0])}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Fixed costs split equally, variable costs by individual usage
          </p>
        </div>

        {/* Individual Owner Flying Hours */}
        <div className="space-y-4">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Owner Flying Hours (Annual)
          </label>
          
          {ownerHours.map((hours, index) => (
            <div key={index} className="space-y-2 pl-4 border-l-2 border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  Owner {index + 1}
                </span>
                <span className="text-base font-semibold text-foreground">{hours} hrs</span>
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
          
          <div className="bg-secondary/50 rounded-lg p-3 mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Owner Hours</span>
              <span className="font-semibold text-foreground">{totalOwnerHours} hrs</span>
            </div>
          </div>
        </div>

        {/* Charter Hours */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-primary" />
              Charter Hours (Annual)
            </label>
            <span className="text-lg font-semibold text-foreground">{charterHours} hrs</span>
          </div>
          <Slider
            value={[charterHours]}
            onValueChange={(v) => onCharterHoursChange(v[0])}
            min={0}
            max={300}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Hours available for charter operations (generates revenue)
          </p>
        </div>

        {/* Total Hours Display */}
        <div className="bg-secondary/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Annual Hours</span>
            <span className="text-lg font-semibold text-primary">{totalHours} hrs</span>
          </div>
        </div>

        {/* VAT Toggle */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <Label htmlFor="vat-toggle" className="text-sm font-medium cursor-pointer">
              Include VAT (25%)
            </Label>
          </div>
          <Switch
            id="vat-toggle"
            checked={includeVAT}
            onCheckedChange={onVATChange}
          />
        </div>
      </div>
    </div>
  );
};
