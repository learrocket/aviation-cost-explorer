import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { aircraftDatabase, type AircraftBudget } from '@/data/aircraftData';
import { Plane } from 'lucide-react';

// Aircraft images
import falconImage from '@/assets/aircraft-falcon-2000-lxs.png';
import g550Image from '@/assets/aircraft-gulfstream-g550.png';
import global6000Image from '@/assets/aircraft-global-6000.png';
import global6500Image from '@/assets/aircraft-global-6500.jpg';
import citationXLSImage from '@/assets/aircraft-citation-xls.png';
import challenger300Image from '@/assets/aircraft-challenger-300.png';
import challenger3500Image from '@/assets/aircraft-challenger-3500.jpg';
import praetor600Image from '@/assets/aircraft-praetor-600.jpg';

const aircraftImages: Record<string, string> = {
  'citation-xls': citationXLSImage,
  'falcon-2000-lxs': falconImage,
  'bombardier-challenger-300': challenger300Image,
  'bombardier-challenger-3500': challenger3500Image,
  'embraer-praetor-600': praetor600Image,
  'gulfstream-g550': g550Image,
  'bombardier-global-6000': global6000Image,
  'bombardier-global-6500': global6500Image,
};

interface AircraftSelectorProps {
  selectedAircraftId: string;
  onSelect: (aircraft: AircraftBudget) => void;
}

export const AircraftSelector = ({ selectedAircraftId, onSelect }: AircraftSelectorProps) => {
  const handleChange = (id: string) => {
    const aircraft = aircraftDatabase.find(a => a.id === id);
    if (aircraft) {
      onSelect(aircraft);
    }
  };

  const selectedAircraft = aircraftDatabase.find(a => a.id === selectedAircraftId);

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Plane className="w-4 h-4 text-primary" />
        Select Aircraft
      </label>

      <Select value={selectedAircraftId} onValueChange={handleChange}>
        <SelectTrigger className="w-full h-12 text-base bg-background">
          <SelectValue placeholder="Choose an aircraft">
            {selectedAircraft?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border">
          {aircraftDatabase.map((aircraft) => (
            <SelectItem key={aircraft.id} value={aircraft.id} className="py-3">
              <div className="flex items-center gap-3">
                {aircraftImages[aircraft.id] && (
                  <img 
                    src={aircraftImages[aircraft.id]} 
                    alt={aircraft.name}
                    className="h-8 w-auto object-contain"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{aircraft.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Fixed: €{(aircraft.totalFixedCostsYearly / 1000000).toFixed(2)}M/year • 
                    Variable: €{aircraft.totalVariableCostPerHour.toLocaleString()}/hour
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Selected aircraft preview */}
      {selectedAircraft && aircraftImages[selectedAircraftId] && (
        <div className="flex flex-col items-center gap-2 py-4 bg-muted/30 rounded-lg">
          <img
            src={aircraftImages[selectedAircraftId]}
            alt={selectedAircraft.name}
            className="h-32 w-auto object-contain"
          />
          <span className="text-sm text-muted-foreground">{selectedAircraft.name}</span>
        </div>
      )}
    </div>
  );
};
