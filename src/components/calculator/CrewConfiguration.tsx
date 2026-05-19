import { Slider } from '@/components/ui/slider';
import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import { Users, UserCheck, User, Wrench } from 'lucide-react';

interface CrewConfigurationProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
  onCaptainsChange: (value: number) => void;
  onFirstOfficersChange: (value: number) => void;
  onCabinCrewChange: (value: number) => void;
  onFlightEngineersChange: (value: number) => void;
}

export const CrewConfiguration = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  onCaptainsChange,
  onFirstOfficersChange,
  onCabinCrewChange,
  onFlightEngineersChange,
}: CrewConfigurationProps) => {
  const captainCost = aircraft.crewCosts.captainTotal * captains;
  const firstOfficerCost = aircraft.crewCosts.firstOfficerTotal * firstOfficers;
  const cabinCrewCost = aircraft.crewCosts.cabinCrewTotal * cabinCrew;
  const flightEngineerCost = aircraft.crewCosts.flightEngineerTotal * flightEngineers;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        Crew Configuration
      </h3>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Captains
            </label>
            <div className="text-right">
              <span className="text-lg font-semibold text-foreground">{captains}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({formatCurrency(captainCost)}/year)
              </span>
            </div>
          </div>
          <Slider
            value={[captains]}
            onValueChange={(v) => onCaptainsChange(v[0])}
            min={0}
            max={4}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {formatCurrency(aircraft.crewCosts.captainTotal)} per captain/year
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              First Officers
            </label>
            <div className="text-right">
              <span className="text-lg font-semibold text-foreground">{firstOfficers}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({formatCurrency(firstOfficerCost)}/year)
              </span>
            </div>
          </div>
          <Slider
            value={[firstOfficers]}
            onValueChange={(v) => onFirstOfficersChange(v[0])}
            min={0}
            max={4}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {formatCurrency(aircraft.crewCosts.firstOfficerTotal)} per first officer/year
          </p>
        </div>

        {aircraft.cabinCrewPolicy === 'none' ? (
          <div className="space-y-2 opacity-50">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Cabin Crew
              </label>
              <span className="text-sm text-muted-foreground">Not applicable</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Light jet — no cabin crew required
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Cabin Crew
                {aircraft.cabinCrewPolicy === 'optional' && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">Optional</span>
                )}
                {aircraft.cabinCrewPolicy === 'required' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Required</span>
                )}
              </label>
              <div className="text-right">
                <span className="text-lg font-semibold text-foreground">{cabinCrew}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({formatCurrency(cabinCrewCost)}/year)
                </span>
              </div>
            </div>
            <Slider
              value={[cabinCrew]}
              onValueChange={(v) => onCabinCrewChange(v[0])}
              min={aircraft.cabinCrewPolicy === 'required' ? 1 : 0}
              max={4}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {formatCurrency(aircraft.crewCosts.cabinCrewTotal)} per cabin crew/year
              {aircraft.cabinCrewPolicy === 'optional' && ' — set to 0 if not needed'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Flight Engineers
            </label>
            <div className="text-right">
              <span className="text-lg font-semibold text-foreground">{flightEngineers}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({formatCurrency(flightEngineerCost)}/year)
              </span>
            </div>
          </div>
          <Slider
            value={[flightEngineers]}
            onValueChange={(v) => onFlightEngineersChange(v[0])}
            min={0}
            max={4}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {formatCurrency(aircraft.crewCosts.flightEngineerTotal)} per flight engineer/year
          </p>
        </div>
      </div>
    </div>
  );
};
