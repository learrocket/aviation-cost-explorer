import { type AircraftBudget } from '@/data/aircraftData';

interface CrewConfiguration {
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
}

interface AnnualAircraftCostParams extends CrewConfiguration {
  aircraft: AircraftBudget;
  ownerHours: number[];
  charterHours: number;
  owners?: number;
}

export interface OwnerCostBreakdown {
  index: number;
  hours: number;
  fixedCost: number;
  variableCost: number;
  charterShare: number;
  totalCost: number;
  effectiveHourlyCost: number;
}

export interface AnnualAircraftCosts {
  crewCosts: number;
  nonCrewFixedCosts: number;
  totalFixedCosts: number;
  totalOwnerHours: number;
  ownerVariableCosts: number;
  charterRevenue: number;
  grossAnnualCost: number;
  netAnnualCost: number;
  effectiveHourlyCost: number;
  fixedCostPerOwner: number;
  ownerCostBreakdown: OwnerCostBreakdown[];
}

export const EXCLUDED_COSTS_NOTE =
  'Landing, handling, parking, crew hotels, per diem, and catering are NOT included in these figures. Expect approximately €3,000–6,000 per sector (outside Bromma).';

export const PER_FLIGHT_TRIP_COST_NOTE = EXCLUDED_COSTS_NOTE;

export const LANDING_HANDLING_NOTE = EXCLUDED_COSTS_NOTE;

const calculateCrewCosts = (aircraft: AircraftBudget, crew: CrewConfiguration) => (
  (aircraft.crewCosts.captainTotal * crew.captains) +
  (aircraft.crewCosts.firstOfficerTotal * crew.firstOfficers) +
  (aircraft.crewCosts.cabinCrewTotal * crew.cabinCrew) +
  (aircraft.crewCosts.flightEngineerTotal * crew.flightEngineers)
);

export const calculateAnnualAircraftCosts = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  ownerHours,
  charterHours,
  owners,
}: AnnualAircraftCostParams): AnnualAircraftCosts => {
  const crewCosts = calculateCrewCosts(aircraft, {
    captains,
    firstOfficers,
    cabinCrew,
    flightEngineers,
  });

  const nonCrewFixedCosts = aircraft.fixedCosts.reduce((sum, cost) => sum + cost.yearlyEUR, 0);
  const totalFixedCosts = crewCosts + nonCrewFixedCosts;
  const totalOwnerHours = ownerHours.reduce((sum, hours) => sum + hours, 0);
  const ownerVariableCosts = aircraft.totalVariableCostPerHour * totalOwnerHours;
  const charterRevenue = aircraft.contributionMarginPerHour * charterHours;
  const grossAnnualCost = totalFixedCosts + ownerVariableCosts;
  const netAnnualCost = grossAnnualCost - charterRevenue;
  const effectiveHourlyCost = totalOwnerHours > 0 ? netAnnualCost / totalOwnerHours : 0;
  const ownerCount = Math.max(owners ?? ownerHours.length, 1);
  const fixedCostPerOwner = totalFixedCosts / ownerCount;

  const ownerCostBreakdown = ownerHours.map((hours, index) => {
    const variableCost = aircraft.totalVariableCostPerHour * hours;
    const charterShare = charterRevenue / ownerCount;
    const totalCost = fixedCostPerOwner + variableCost - charterShare;

    return {
      index,
      hours,
      fixedCost: fixedCostPerOwner,
      variableCost,
      charterShare,
      totalCost,
      effectiveHourlyCost: hours > 0 ? totalCost / hours : 0,
    };
  });

  return {
    crewCosts,
    nonCrewFixedCosts,
    totalFixedCosts,
    totalOwnerHours,
    ownerVariableCosts,
    charterRevenue,
    grossAnnualCost,
    netAnnualCost,
    effectiveHourlyCost,
    fixedCostPerOwner,
    ownerCostBreakdown,
  };
};

export const calculateDefaultComparisonCosts = ({
  aircraft,
  ownerHours,
  charterHours,
}: {
  aircraft: AircraftBudget;
  ownerHours: number;
  charterHours: number;
}) => {
  const annualCosts = calculateAnnualAircraftCosts({
    aircraft,
    captains: aircraft.defaultCrewConfig.captains,
    firstOfficers: aircraft.defaultCrewConfig.firstOfficers,
    cabinCrew: aircraft.defaultCrewConfig.cabinCrew,
    flightEngineers: aircraft.defaultCrewConfig.flightEngineers,
    ownerHours: [ownerHours],
    charterHours,
    owners: 1,
  });

  return {
    ...annualCosts,
    variableCostPerHour: aircraft.totalVariableCostPerHour,
    charterMargin: aircraft.contributionMarginPerHour,
    fuelConsumption: aircraft.fuelConsumptionPerHour,
    cabinHeight: aircraft.cabinHeight,
    rangeNM: aircraft.rangeNM,
    passengerCapacity: aircraft.passengerCapacity,
  };
};