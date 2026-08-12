// Complete aircraft budget data extracted from Excel files
// Last updated: 2026/01/01

export interface CrewCosts {
  captainTotal: number;
  firstOfficerTotal: number;
  cabinCrewTotal: number;
  flightEngineerTotal: number;
}

export interface FixedCostItem {
  category: string;
  name: string;
  monthlyEUR: number;
  yearlyEUR: number;
  notes?: string;
}

export interface VariableCostItem {
  name: string;
  costPerHour: number;
  notes?: string;
  /**
   * Optional program-minimum metadata. When present, the calculator will show
   * a "How pricing works" explainer for this line, since below the annual
   * minimum hours you pay a flat minimum charge regardless of actual usage.
   */
  minHoursPerYear?: number;
  annualMinimumEUR?: number;
  ratePerHourEUR?: number; // effective per-hour rate above the minimum (usually === costPerHour)
}

export interface DefaultCrewConfig {
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
}

export interface AircraftBudget {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  year: number;
  exchangeRateUSDEUR: number;
  fuelPricePerLiter: number;
  fuelConsumptionPerHour: number;
  cabinHeight: number; // in meters
  rangeNM: number; // range in nautical miles
  passengerCapacity: number; // typical passenger capacity
  hasAPU?: boolean; // whether aircraft has APU (important for light jets comparison)
  cabinCrewPolicy: 'none' | 'optional' | 'required'; // none=XLS, optional=Challenger, required=larger jets
  // Warranty toggle support (new airframes only). When in-warranty, the listed
  // per-hour savings are subtracted from variable cost (covers engine + parts + airframe maint).
  warrantyAvailable?: boolean;
  warrantySavingsPerHour?: number;
  
  crewCosts: CrewCosts;
  defaultCrewConfig: DefaultCrewConfig;
  
  fixedCosts: FixedCostItem[];
  variableCosts: VariableCostItem[];
  
  totalFixedCostsYearly: number;
  totalVariableCostPerHour: number;
  charterPricePerHour: number;
  contributionMarginPerHour: number;
}

// ============================================
// CESSNA CITATION XLS Budget (from Excel)
// ============================================
// Exchange Rate: USD/EUR = 0.865
// Total Fixed: €844,720/year (includes Engine Program & Parts Program)
// Total Variable: €1,473/hour
// Charter Price: €4,500/hour
// Contribution Margin: €3,027/hour (4500 - 1473)
// NOTE: This aircraft HAS APU (included in fixed Engine Program cost)
const citationXLS: AircraftBudget = {
  id: 'citation-xls',
  name: 'Cessna Citation XLS',
  manufacturer: 'Cessna',
  model: 'Citation XLS',
  year: 2025,
  exchangeRateUSDEUR: 0.865,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 720, // ~900 lbs/hr = ~408kg/hr = ~510L/hr cruise, higher average
  cabinHeight: 1.73, // 5 ft 8 in
  rangeNM: 2100, // ~2,100 NM typical
  passengerCapacity: 9, // Typical 8-9 pax configuration
  hasAPU: true, // Citation XLS has APU (important for comparison with Phenom 300)
  cabinCrewPolicy: 'none', // Light jet - no cabin crew needed
  
  // Crew costs from Excel: €350,000 for 2 Captains & 2 FOs
  // Assuming 2 captains at higher rate and 2 FOs at lower rate
  // Total 350,000 / 4 pilots = 87,500 average
  // Split: Captains ~€100,000 each, FOs ~€75,000 each
  crewCosts: {
    captainTotal: 100000,      // Estimated from €350,000 total for 4 pilots
    firstOfficerTotal: 75000,  // Estimated from €350,000 total for 4 pilots
    cabinCrewTotal: 0,         // No cabin crew for light jet
    flightEngineerTotal: 65000, // Short/mid-range engineer rate (same as Challenger)
  },
  
  // Default crew configuration (2 captains & 1 first officer = 3 pilots)
  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 1,
    cabinCrew: 0,           // No cabin crew for light jet
    flightEngineers: 0.5,   // Half-time technician
  },
  
  // Fixed costs from Excel (Engine & Parts programs moved here for consistency with other aircraft)
  fixedCosts: [
    { category: 'Management', name: 'Management Fee', monthlyEUR: 5000, yearlyEUR: 60000, notes: '1903 Aviations AOC' },
    { category: 'Management', name: 'CAMO', monthlyEUR: 1800, yearlyEUR: 21600, notes: 'Monitoring program' },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 3460, yearlyEUR: 41520, notes: '$48,000 × 0.865 - McGill' },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 5500, yearlyEUR: 66000, notes: 'Our hangar at Bromma' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 5046, yearlyEUR: 60550, notes: '$70,000 × 0.865 - Yearly training cost pilots' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 400, yearlyEUR: 4800, notes: 'Bombardier/engines etc' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 360, yearlyEUR: 4325, notes: '$5,000 × 0.865 - Jeppesen, Foreflight, Ipreflight' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 1517, yearlyEUR: 18200, notes: 'Maintenance program' },
    { category: 'Technology', name: 'Trip Planning', monthlyEUR: 1500, yearlyEUR: 18000, notes: 'Special flights/flight permits' },
    { category: 'Technology', name: 'SatCom', monthlyEUR: 360, yearlyEUR: 4325, notes: '$5,000 × 0.865 - Satphone, ACARS' },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 800, yearlyEUR: 12000, notes: 'Mobile, uniform etc' },
    { category: 'Maintenance', name: 'Engine Program & APU', monthlyEUR: 9517, yearlyEUR: 114200, notes: '$660/hr × 200h minimum × 0.865 - Annual fixed program' },
    { category: 'Maintenance', name: 'Parts Program', monthlyEUR: 5767, yearlyEUR: 69200, notes: '$400/hr × 200h minimum × 0.865 - Parts on program' },
  ],
  
  // Variable costs - only direct operating costs per flight hour
  variableCosts: [
    { name: 'Fuel', costPerHour: 1125, notes: '900L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 175, notes: 'Eurocontrol/overflight cost' },
    { name: 'Airframe Maintenance Labour', costPerHour: 173, notes: '$200 × 0.865 - Maintenance reserves' },
  ],
  
  totalFixedCostsYearly: 844720, // 661,320 + 114,200 + 69,200 = 844,720
  totalVariableCostPerHour: 1473, // 1125 + 175 + 173
  charterPricePerHour: 4500,
  contributionMarginPerHour: 3027, // 4500 - 1473
};

// ============================================
// FALCON 2000 LXS Budget (from Excel)
// ============================================
// Exchange Rate: USD/EUR = 0.85
// Total Fixed: €1,960,418/year
// Total Variable: €2,861/hour
// Charter Price: €7,000/hour
// Contribution Margin: €4,139.05/hour (7000 - 2860.95)
const falcon2000LXS: AircraftBudget = {
  id: 'falcon-2000-lxs',
  name: 'Dassault Falcon 2000 LXS',
  manufacturer: 'Dassault',
  model: 'Falcon 2000 LXS',
  year: 2026,
  exchangeRateUSDEUR: 0.85,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1100, // Corrected: 1,100L per hour
  cabinHeight: 1.88, // 6 ft 2 in
  rangeNM: 3800, // ~3,800 NM typical for Falcon 2000 LXS
  passengerCapacity: 10, // Typical 8-10 pax configuration
  cabinCrewPolicy: 'required', // Large cabin - flight attendant required
  
  // Crew costs per person per year (Excel shows totals for default crew count)
  // Excel: 281,835 for 2 captains = 140,918 each
  // Excel: 105,688 for 1 first officer = 105,688 each
  // Excel: 153,600 for full-time technician, default is 0.5 (part-time)
  crewCosts: {
    captainTotal: 140918,       // 281,835 ÷ 2 captains = 140,918/captain
    firstOfficerTotal: 105688,  // 105,688 ÷ 1 first officer = 105,688/FO
    cabinCrewTotal: 76800,      // Cost per cabin crew/year
    flightEngineerTotal: 76800, // €76,800/year for part-time technician
  },
  
  // Default crew configuration from Excel
  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 1,      // Excel shows 1 first officer
    cabinCrew: 1,          // Excel shows 1 cabin crew
    flightEngineers: 0.5,  // Excel shows 0.5 (half technician)
  },
  
  // Fixed costs from Excel Page 3
  fixedCosts: [
    // Crew - calculated dynamically based on crew config, so not listed here
    { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Personalförsäkringar, reseförsäkring och sjukförsäkring' },
    { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 10000, yearlyEUR: 120000, notes: 'Kostnaden för att ha flygplanet på tillstånd' },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 3188, yearlyEUR: 38250, notes: '$45,000 × 0.85 - Värde ca 25 MUSD' },
    { category: 'Maintenance', name: 'Motor Program (Rolls Royce)', monthlyEUR: 28333, yearlyEUR: 340000, notes: '$400,000 × 0.85' },
    { category: 'Maintenance', name: 'Parts / SmartParts+', monthlyEUR: 31875, yearlyEUR: 382500, notes: '$450,000 × 0.85' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 992, yearlyEUR: 11900, notes: '$14,000 × 0.85 - Uppföljningsprogram för flygplanet' },
    { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 850, yearlyEUR: 10200, notes: '$12,000 × 0.85 - Navigationskort i cockpit' },
    { category: 'Technology', name: 'Satcom', monthlyEUR: 1473, yearlyEUR: 17680, notes: '$20,800 × 0.85 - Satcom Direct' },
    { category: 'Technology', name: 'Starlink', monthlyEUR: 1700, yearlyEUR: 20400, notes: '$24,000 × 0.85 - Internet' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 850, yearlyEUR: 10200, notes: '$12,000 × 0.85 - Manualer från tillverkaren' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 850, yearlyEUR: 10200, notes: '$12,000 × 0.85 - Jeppesen, ipads, APG, ForeFlight' },
    { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Uppföljningsprogram för aktuella flygningar' },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 12000, yearlyEUR: 144000, notes: 'Delad hangar' },
    { category: 'Safety', name: 'Medair', monthlyEUR: 1622, yearlyEUR: 19465, notes: '$22,900 × 0.85' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 20542, yearlyEUR: 246500, notes: '$290,000 × 0.85 - Simulatorutbildning för 4 piloter' },
    { category: 'Equipment', name: 'Tools Technician', monthlyEUR: 417, yearlyEUR: 5000, notes: 'Löpande uppdatering av verktyg till hangaren' },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 2083, yearlyEUR: 25000, notes: 'Mobil, uniform, medical etc' },
  ],
  
  // Variable costs from Excel Page 4 - CORRECTED
  variableCosts: [
    { name: 'Fuel', costPerHour: 1375, notes: '1,100L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 340, notes: '$400 × 0.85 - Eurocontrol' },
    { name: 'APU Honeywell', costPerHour: 87, notes: '$205 × 0.85 × 50% APU time' },
    { name: 'Airframe Maintenance Labour', costPerHour: 1059, notes: '€900 + markup - Avsättningar för kommande service' },
  ],
  
  totalFixedCostsYearly: 1960418,
  totalVariableCostPerHour: 2861, // 1375 + 340 + 87 + 1059
  charterPricePerHour: 7000,
  contributionMarginPerHour: 4139, // 7000 - 2861
};

// ============================================
// GULFSTREAM G550 Budget (from Excel)
// ============================================
// Exchange Rate: USD/EUR = 0.85
// Total Fixed: €2,277,076/year
// Total Variable: €4,028/hour
// Charter Price: €7,500/hour
// Contribution Margin: €3,472.50/hour (7500 - 4027.50)
const gulfstreamG550: AircraftBudget = {
  id: 'gulfstream-g550',
  name: 'Gulfstream G550',
  manufacturer: 'Gulfstream',
  model: 'G550',
  year: 2026,
  exchangeRateUSDEUR: 0.85,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1600, // Corrected: 1,600L per hour
  cabinHeight: 1.88, // 6 ft 2 in
  rangeNM: 6500, // 6,500 NM from comparison data
  passengerCapacity: 14, // Typical 13-16 pax configuration
  cabinCrewPolicy: 'required', // Large cabin - flight attendant required
  
  // Excel: 281,835 for 2 captains = 140,918 each
  // Excel: 211,376 for 2 first officers = 105,688 each
  // Excel: 153,600 for full-time technician, default is 0.5
  crewCosts: {
    captainTotal: 140918,       // 281,835 ÷ 2 captains = 140,918/captain
    firstOfficerTotal: 105688,  // 211,376 ÷ 2 first officers = 105,688/FO
    cabinCrewTotal: 76800,
    flightEngineerTotal: 76800, // €76,800/year for part-time technician
  },
  
  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 2,      // Excel shows 2 first officers
    cabinCrew: 1,          // Excel shows 1 cabin crew
    flightEngineers: 0.5,  // Excel shows 0.5 (half technician)
  },
  
  // Fixed costs from Excel
  fixedCosts: [
    { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Personalförsäkringar, reseförsäkring och sjukförsäkring' },
    { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 15000, yearlyEUR: 180000, notes: 'Kostnaden för att ha flygplanet på tillstånd' },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 4583, yearlyEUR: 55000, notes: 'EUR input' },
    { category: 'Maintenance', name: 'Motor Program (Rolls Royce)', monthlyEUR: 28583, yearlyEUR: 343000, notes: 'EUR input' },
    { category: 'Maintenance', name: 'Parts / SmartParts+', monthlyEUR: 42075, yearlyEUR: 504900, notes: '$594,000 × 0.85' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 1417, yearlyEUR: 17000, notes: '$20,000 × 0.85' },
    { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 970, yearlyEUR: 11645, notes: '$13,700 × 0.85' },
    { category: 'Technology', name: 'Satcom', monthlyEUR: 1473, yearlyEUR: 17680, notes: '$20,800 × 0.85' },
    { category: 'Technology', name: 'Starlink', monthlyEUR: 2125, yearlyEUR: 25500, notes: '$30,000 × 0.85' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 2090, yearlyEUR: 25075, notes: '$29,500 × 0.85' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 2833, yearlyEUR: 34000, notes: '$40,000 × 0.85' },
    { category: 'Technology', name: 'Flight Data Monitor', monthlyEUR: 333, yearlyEUR: 4000, notes: 'EUR input' },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 10833, yearlyEUR: 130000, notes: 'Delad hangar' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 17917, yearlyEUR: 215000, notes: 'EUR input' },
    { category: 'Equipment', name: 'Tools Technician', monthlyEUR: 417, yearlyEUR: 5000, notes: 'Löpande uppdatering av verktyg' },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 2083, yearlyEUR: 25000, notes: 'Mobil, uniform, medical etc' },
    { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 750, yearlyEUR: 9000 },
    { category: 'Safety', name: 'Medair', monthlyEUR: 1622, yearlyEUR: 19465, notes: '$22,900 × 0.85' },
  ],
  
  // Variable costs from Excel Page 4 - CORRECTED
  variableCosts: [
    { name: 'Fuel', costPerHour: 2000, notes: '1,600L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 425, notes: '$500 × 0.85' },
    { name: 'APU Honeywell', costPerHour: 103, notes: '€205 × 50%' },
    { name: 'Airframe Maintenance Labour', costPerHour: 1500, notes: '€1,500 - Avsättningar för kommande service' },
  ],
  
  totalFixedCostsYearly: 2277076,
  totalVariableCostPerHour: 4028, // 2000 + 425 + 103 + 1500
  charterPricePerHour: 7500,
  contributionMarginPerHour: 3472, // 7500 - 4028
};

// ============================================
// BOMBARDIER GLOBAL 6000 Budget (from Excel)
// ============================================
// Exchange Rate: USD/EUR = 0.85
// Total Fixed: €1,513,877/year (Engine & Parts moved to variable like Challenger)
// Total Variable: €7,463/hour (includes Engine & Parts per-hour)
// Charter Price: €8,500/hour
// Contribution Margin: €1,037/hour (8500 - 7463)
const bombardierGlobal6000: AircraftBudget = {
  id: 'bombardier-global-6000',
  name: 'Bombardier Global 6000',
  manufacturer: 'Bombardier',
  model: 'Global 6000',
  year: 2026,
  exchangeRateUSDEUR: 0.85,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1800,
  cabinHeight: 1.91, // 6 ft 3 in
  rangeNM: 5800, // 5,800 NM from comparison data
  passengerCapacity: 14, // Typical 13-17 pax configuration
  cabinCrewPolicy: 'required', // Large cabin - flight attendant required
  
  // Same cost structure as G550
  crewCosts: {
    captainTotal: 140918,       // 281,835 ÷ 2 captains = 140,918/captain
    firstOfficerTotal: 105688,  // 211,376 ÷ 2 first officers = 105,688/FO
    cabinCrewTotal: 76800,
    flightEngineerTotal: 76800, // €76,800/year for part-time technician
  },
  
  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 2,
    cabinCrew: 1,
    flightEngineers: 0.5,
  },
  
  // Fixed costs from Excel
  fixedCosts: [
    { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000 },
    { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 15000, yearlyEUR: 180000 },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 5667, yearlyEUR: 68000, notes: '$80,000 × 0.85' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 1558, yearlyEUR: 18700, notes: '$22,000 × 0.85' },
    { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 970, yearlyEUR: 11645, notes: '$13,700 × 0.85' },
    { category: 'Technology', name: 'Satcom', monthlyEUR: 1473, yearlyEUR: 17680, notes: '$20,800 × 0.85' },
    { category: 'Technology', name: 'Starlink', monthlyEUR: 1700, yearlyEUR: 20400, notes: '$24,000 × 0.85' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 2090, yearlyEUR: 25075, notes: '$29,500 × 0.85' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 2833, yearlyEUR: 34000, notes: '$40,000 × 0.85' },
    { category: 'Technology', name: 'Flight Data Monitor', monthlyEUR: 333, yearlyEUR: 4000 },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 12000, yearlyEUR: 144000, notes: 'Delad hangar' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 26208, yearlyEUR: 314500, notes: '$370,000 × 0.85' },
    { category: 'Equipment', name: 'Tools Technician', monthlyEUR: 417, yearlyEUR: 5000 },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 2083, yearlyEUR: 25000 },
    { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 750, yearlyEUR: 9000 },
    { category: 'Safety', name: 'Medair', monthlyEUR: 1622, yearlyEUR: 19465, notes: '$22,900 × 0.85' },
  ],
  
  variableCosts: [
    { name: 'Fuel', costPerHour: 2250, notes: '1,800L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 425, notes: '$500 × 0.85' },
    { name: 'Engine Program (both engines)', costPerHour: 1126, notes: '$1,325/hr × 0.85 — min $530,000/yr at 400h' },
    { name: 'SmartParts', costPerHour: 1122, notes: '$1,320/hr × 0.85 — min $330,000/yr at 250h' },
    { name: 'APU Honeywell', costPerHour: 103, notes: '€205 × 50%' },
    { name: 'Airframe Maintenance Labour', costPerHour: 1500 },
  ],
  
  totalFixedCostsYearly: 1513877,
  totalVariableCostPerHour: 6526, // 2250 + 425 + 1126 + 1122 + 103 + 1500
  charterPricePerHour: 8500,
  contributionMarginPerHour: 1974, // 8500 - 6526
};

// ============================================
// BOMBARDIER CHALLENGER 300 Budget (from Excel)
// ============================================
// Exchange Rate: USD/EUR = 0.847
// Total Fixed: €1,074,881/year (non-crew €589,881 + default crew €485,000)
// Total Variable: €3,874/hour (excl. landing & handling)
// Charter Price: €7,000/hour (excl. landing & handling)
// Contribution Margin: €3,126/hour (7000 - 3874)
const bombardierChallenger300: AircraftBudget = {
  id: 'bombardier-challenger-300',
  name: 'Bombardier Challenger 300',
  manufacturer: 'Bombardier',
  model: 'Challenger 300',
  year: 2026,
  exchangeRateUSDEUR: 0.847,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1000, // 1,000L per hour
  cabinHeight: 1.85, // 6 ft 1 in
  rangeNM: 3100, // ~3,100 NM typical
  passengerCapacity: 9, // Typical 8-9 pax configuration
  cabinCrewPolicy: 'optional', // Super-mid - flight attendant optional

  // Crew costs from Excel: €125,000/captain, €100,000/FO
  // Default config (2 captains + 1 FO) = €350,000 total pilot cost
  crewCosts: {
    captainTotal: 125000,       // €125,000 per captain
    firstOfficerTotal: 100000,  // €100,000 per first officer
    cabinCrewTotal: 70000,      // €70,000 per cabin crew
    flightEngineerTotal: 130000, // €130,000 full-time rate (×0.5 for default)
  },

  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 1,
    cabinCrew: 1,
    flightEngineers: 0.5, // Half-time technician
  },

  // Fixed costs from Excel - Budget_EURO_Challenger_300_2026_1.xlsx
  fixedCosts: [
    { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Personalförsäkringar, reseförsäkring och sjukförsäkring' },
    { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 11800, yearlyEUR: 141600, notes: 'Kostnaden för att ha flygplanet på tillstånd' },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 3388, yearlyEUR: 40656, notes: '$48,000 × 0.847 - Värde ca 10 MUSD' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 1592, yearlyEUR: 19100, notes: 'Uppföljningsprogram för flygplanet' },
    { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 1341, yearlyEUR: 16093, notes: '$19,000 × 0.847 - Navigationskort i cockpit' },
    { category: 'Technology', name: 'SatCom', monthlyEUR: 424, yearlyEUR: 5082, notes: '$6,000 × 0.847 - Satcom Direct' },
    { category: 'Technology', name: 'Starlink', monthlyEUR: 1694, yearlyEUR: 20328, notes: '$24,000 × 0.847 - Internet' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 1059, yearlyEUR: 12705, notes: '$15,000 × 0.847 - Manualer från tillverkaren' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 1376, yearlyEUR: 16517, notes: '$19,500 × 0.847 - Jeppesen, iPads, APG, ForeFlight, Leon' },
    { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 1033, yearlyEUR: 12400, notes: 'Säljportal för flygplanet på chartermarknaden' },
    { category: 'Technology', name: 'Trip Planning', monthlyEUR: 1700, yearlyEUR: 20400, notes: 'Trip planning cost' },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 10000, yearlyEUR: 120000, notes: 'Bromma airport' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 12000, yearlyEUR: 144000, notes: 'Simulatorutbildning för 3 piloter × €48,000' },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 1000, yearlyEUR: 12000, notes: 'Mobil, uniform till piloter, kabin, tekniker' },
  ],

  // Variable costs - EXCLUDES landing, handling, hotels, catering (see disclaimer)
  variableCosts: [
    { name: 'Fuel', costPerHour: 1250, notes: '1,000L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 296, notes: '$350 × 0.847 - Eurocontrol' },
    { name: 'Engine Program (both engines)', costPerHour: 1045, notes: '$1,234/hr × 0.847 — min 300h/yr' },
    { name: 'SmartParts', costPerHour: 630, notes: '$744/hr × 0.847' },
    { name: 'APU Honeywell', costPerHour: 103, notes: '$152 × 0.847 × 80% usage' },
    { name: 'Airframe Maintenance Labour', costPerHour: 550, notes: 'Avsättningar för kommande service' },
  ],

  totalFixedCostsYearly: 1074881, // Non-crew: €589,881 + Default crew: €485,000
  totalVariableCostPerHour: 3874, // 1250 + 296 + 1045 + 630 + 103 + 550
  charterPricePerHour: 7000, // Ex landing & handling
  contributionMarginPerHour: 3126, // 7000 - 3874
};

// ============================================
// Shared config: CL 3500 + Praetor 600 (same operator category)
// Source: Budget_EURO_Challenger_300_2026_till_3500.xlsx (2026/05/18)
// USD/EUR = 0.86. Crew & fixed costs identical between the two airframes.
// ============================================
const sharedSuperMidCrew: CrewCosts = {
  captainTotal: 120000,      // 240,000 / 2 captains
  firstOfficerTotal: 120000, // 120,000 / 1 FO
  cabinCrewTotal: 70000,
  flightEngineerTotal: 130000, // ×0.5 default = €65,000
};

const sharedSuperMidCrewDefault: DefaultCrewConfig = {
  captains: 2,
  firstOfficers: 1,
  cabinCrew: 1,
  flightEngineers: 0.5,
};

const sharedSuperMidFixedCosts: FixedCostItem[] = [
  { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Personalförsäkringar, reseförsäkring och sjukförsäkring' },
  { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 11800, yearlyEUR: 141600, notes: 'Kostnaden för att ha flygplanet på tillstånd' },
  { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 4792, yearlyEUR: 57500, notes: 'EUR input' },
  { category: 'Technology', name: 'CAMP', monthlyEUR: 1592, yearlyEUR: 19100, notes: 'Uppföljningsprogram för flygplanet' },
  { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 1362, yearlyEUR: 16340, notes: '$19,000 × 0.86 - Navigationskort i cockpit' },
  { category: 'Technology', name: 'SatCom', monthlyEUR: 430, yearlyEUR: 5160, notes: '$6,000 × 0.86 - Satcom Direct' },
  { category: 'Technology', name: 'Starlink', monthlyEUR: 1720, yearlyEUR: 20640, notes: '$24,000 × 0.86 - Internet' },
  { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 1075, yearlyEUR: 12900, notes: '$15,000 × 0.86 - Manualer från tillverkaren' },
  { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 1398, yearlyEUR: 16770, notes: '$19,500 × 0.86 - Jeppesen, iPads, APG, ForeFlight, Leon' },
  { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 1033, yearlyEUR: 12400, notes: 'Säljportal för flygplanet på chartermarknaden' },
  { category: 'Technology', name: 'Trip Planning', monthlyEUR: 1700, yearlyEUR: 20400, notes: 'Trip planning cost' },
  { category: 'Base Operations', name: 'Hangar', monthlyEUR: 10000, yearlyEUR: 120000, notes: 'Bromma airport' },
  { category: 'Training', name: 'Education / Training', monthlyEUR: 12000, yearlyEUR: 144000, notes: 'Simulatorutbildning för 3 piloter × €48,000' },
  { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 1000, yearlyEUR: 12000, notes: 'Mobil, uniform till piloter, kabin, tekniker' },
];

// ============================================
// BOMBARDIER CHALLENGER 3500 (super-midsize)
// Total Fixed: €1,102,810/year • Variable: €4,207/hr • Charter: €7,000/hr
// ============================================
const bombardierChallenger3500: AircraftBudget = {
  id: 'bombardier-challenger-3500',
  name: 'Bombardier Challenger 3500',
  manufacturer: 'Bombardier',
  model: 'Challenger 3500',
  year: 2026,
  exchangeRateUSDEUR: 0.86,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1000,
  cabinHeight: 1.85,
  rangeNM: 3300,
  passengerCapacity: 9,
  cabinCrewPolicy: 'optional',
  warrantyAvailable: true,
  warrantySavingsPerHour: 541, // engine + parts + airframe maint while in warranty

  crewCosts: sharedSuperMidCrew,
  defaultCrewConfig: sharedSuperMidCrewDefault,
  fixedCosts: sharedSuperMidFixedCosts,

  variableCosts: [
    { name: 'Fuel', costPerHour: 1250, notes: '1,000L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 301, notes: '$350 × 0.86 - Eurocontrol' },
    { name: 'Engine Program (both engines)', costPerHour: 1061, notes: '$1,234/hr × 0.86 — Honeywell', minHoursPerYear: 300, ratePerHourEUR: 1061, annualMinimumEUR: 318300 },
    { name: 'SmartParts', costPerHour: 640, notes: '$744/hr × 0.86 — Bombardier SmartParts+', minHoursPerYear: 250, ratePerHourEUR: 640, annualMinimumEUR: 160000 },
    { name: 'APU Honeywell', costPerHour: 105, notes: '$152 × 0.86 × 80% APU usage' },
    { name: 'Airframe Maintenance Labour', costPerHour: 850, notes: 'Avsättningar för kommande service' },
  ],

  totalFixedCostsYearly: 1102810,
  totalVariableCostPerHour: 4207, // 1250+301+1061+640+105+850
  charterPricePerHour: 7000,
  contributionMarginPerHour: 2793,
};

// ============================================
// EMBRAER PRAETOR 600 (super-midsize)
// Same fixed-cost category as CL 3500. Variable: €4,101/hr (lower airframe maint)
// ============================================
const embraerPraetor600: AircraftBudget = {
  id: 'embraer-praetor-600',
  name: 'Embraer Praetor 600',
  manufacturer: 'Embraer',
  model: 'Praetor 600',
  year: 2026,
  exchangeRateUSDEUR: 0.86,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1000,
  cabinHeight: 1.83,
  rangeNM: 3700,
  passengerCapacity: 9,
  cabinCrewPolicy: 'optional',
  warrantyAvailable: true,
  warrantySavingsPerHour: 541, // placeholder per source file — pending Embraer Executive Care quote

  crewCosts: sharedSuperMidCrew,
  defaultCrewConfig: sharedSuperMidCrewDefault,
  fixedCosts: sharedSuperMidFixedCosts,

  variableCosts: [
    { name: 'Fuel', costPerHour: 1250, notes: '1,000L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 301, notes: '$350 × 0.86 - Eurocontrol' },
    { name: 'Engine Program (both engines)', costPerHour: 1061, notes: '$1,234/hr × 0.86 — placeholder, pending Embraer quote', minHoursPerYear: 300, ratePerHourEUR: 1061, annualMinimumEUR: 318300 },
    { name: 'SmartParts / EEC', costPerHour: 640, notes: '$744/hr × 0.86 — placeholder, pending Embraer Executive Care', minHoursPerYear: 250, ratePerHourEUR: 640, annualMinimumEUR: 160000 },
    { name: 'APU Honeywell', costPerHour: 105, notes: '$152 × 0.86 × 80% APU usage' },
    { name: 'Airframe Maintenance Labour', costPerHour: 744, notes: 'Praetor-specific — lower than CL3500 (€850/hr)' },
  ],

  totalFixedCostsYearly: 1102810,
  totalVariableCostPerHour: 4101, // 1250+301+1061+640+105+744
  charterPricePerHour: 7000,
  contributionMarginPerHour: 2899,
};

// ============================================
// BOMBARDIER GLOBAL 6500 (long-range heavy jet)
// Source: Global_6500 budget xlsx (2026/07/07). USD/EUR = 0.85.
// Total Fixed: €1,552,276/year • Variable: €6,140/hr • Charter: €8,500/hr
// Program minimums: Motor RR 300h/yr, SmartParts+ 250h/yr.
// ============================================
const bombardierGlobal6500: AircraftBudget = {
  id: 'bombardier-global-6500',
  name: 'Bombardier Global 6500',
  manufacturer: 'Bombardier',
  model: 'Global 6500',
  year: 2026,
  exchangeRateUSDEUR: 0.85,
  fuelPricePerLiter: 1.25,
  fuelConsumptionPerHour: 1800,
  cabinHeight: 1.91,
  rangeNM: 6600,
  passengerCapacity: 14,
  cabinCrewPolicy: 'required',
  // Warranty toggle intentionally omitted — only the super-mid new airframes
  // (CL 3500, Praetor 600) have warranty pricing in scope.

  crewCosts: {
    captainTotal: 140918,       // 281,835 / 2 captains
    firstOfficerTotal: 105688,  // 211,376 / 2 first officers
    cabinCrewTotal: 76800,
    flightEngineerTotal: 153600, // full-time rate; default is 0.5
  },

  defaultCrewConfig: {
    captains: 2,
    firstOfficers: 2,
    cabinCrew: 1,
    flightEngineers: 0.5,
  },

  fixedCosts: [
    { category: 'Insurance', name: 'Health & Travel Insurance', monthlyEUR: 750, yearlyEUR: 9000, notes: 'Personalförsäkringar, reseförsäkring och sjukförsäkring' },
    { category: 'Management', name: 'Management Fee / CAMO', monthlyEUR: 15000, yearlyEUR: 180000, notes: 'Kostnaden för att ha flygplanet på tillstånd' },
    { category: 'Insurance', name: 'Aircraft Insurance', monthlyEUR: 5667, yearlyEUR: 68000, notes: '$80,000 × 0.85 — Värde ca 25 MUSD' },
    { category: 'Technology', name: 'CAMP', monthlyEUR: 1558, yearlyEUR: 18700, notes: '$22,000 × 0.85' },
    { category: 'Technology', name: 'INDS (Nav DB + Charts)', monthlyEUR: 970, yearlyEUR: 11645, notes: '$13,700 × 0.85' },
    { category: 'Technology', name: 'Satcom', monthlyEUR: 1473, yearlyEUR: 17680, notes: '$20,800 × 0.85' },
    { category: 'Technology', name: 'Starlink', monthlyEUR: 1700, yearlyEUR: 20400, notes: '$24,000 × 0.85' },
    { category: 'Technology', name: 'Technical Manuals', monthlyEUR: 2090, yearlyEUR: 25075, notes: '$29,500 × 0.85' },
    { category: 'Technology', name: 'Electronic Flight Bags (EFB)', monthlyEUR: 2833, yearlyEUR: 34000, notes: '$40,000 × 0.85' },
    { category: 'Technology', name: 'Flight Data Monitor', monthlyEUR: 333, yearlyEUR: 4000 },
    { category: 'Base Operations', name: 'Hangar', monthlyEUR: 12000, yearlyEUR: 144000, notes: 'Delad hangar' },
    { category: 'Training', name: 'Education / Training', monthlyEUR: 26208, yearlyEUR: 314500, notes: '$370,000 × 0.85 — Simulatorutbildning för 4 piloter' },
    { category: 'Equipment', name: 'Tools Technician', monthlyEUR: 417, yearlyEUR: 5000 },
    { category: 'Other', name: 'Others (mobile, uniform, medical)', monthlyEUR: 2083, yearlyEUR: 25000 },
    { category: 'Charter Operations', name: 'Avinode', monthlyEUR: 750, yearlyEUR: 9000 },
    { category: 'Safety', name: 'Medair', monthlyEUR: 1622, yearlyEUR: 19465, notes: '$22,900 × 0.85' },
  ],

  variableCosts: [
    { name: 'Fuel', costPerHour: 2250, notes: '1,800L × €1.25/L' },
    { name: 'En Route Fees', costPerHour: 425, notes: '$500 × 0.85 - Eurocontrol' },
    { name: 'Engine Program (both engines)', costPerHour: 1615, notes: '$1,900/hr × 0.85 — Rolls-Royce CorporateCare', minHoursPerYear: 300, ratePerHourEUR: 1615, annualMinimumEUR: 484500 },
    { name: 'SmartParts', costPerHour: 300, notes: '$353/hr × 0.85 — Bombardier SmartParts+', minHoursPerYear: 250, ratePerHourEUR: 300, annualMinimumEUR: 75013 },
    { name: 'APU Honeywell', costPerHour: 50, notes: '$100 × 0.85 × 50% APU usage' },
    { name: 'Airframe Maintenance Labour', costPerHour: 1500, notes: 'Avsättningar för kommande service' },
  ],

  totalFixedCostsYearly: 1552276,
  totalVariableCostPerHour: 6140, // 2250+425+1615+300+50+1500
  charterPricePerHour: 8500,
  contributionMarginPerHour: 2360,
};

// Active aircraft shown in the calculator
export const aircraftDatabase: AircraftBudget[] = [
  bombardierChallenger3500,
  embraerPraetor600,
  bombardierGlobal6500,
];

// Inactive aircraft kept for future reference
export const inactiveAircraft: AircraftBudget[] = [
  bombardierChallenger300,
  citationXLS,
  falcon2000LXS,
  gulfstreamG550,
  bombardierGlobal6000,
];

export const getAircraftById = (id: string): AircraftBudget | undefined => {
  return aircraftDatabase.find(aircraft => aircraft.id === id);
};

export type DisplayCurrency = 'EUR' | 'USD' | 'SEK';

let _displayCurrency: DisplayCurrency = 'EUR';
let _exchangeRates: Record<DisplayCurrency, number> = { EUR: 1, USD: 1.08, SEK: 11.2 };

export const setDisplayCurrency = (currency: DisplayCurrency, rates?: Record<DisplayCurrency, number>) => {
  _displayCurrency = currency;
  if (rates) _exchangeRates = rates;
};

export const getDisplayCurrency = () => _displayCurrency;

export const formatCurrency = (amountEUR: number): string => {
  const converted = amountEUR * _exchangeRates[_displayCurrency];
  const locale = _displayCurrency === 'SEK' ? 'sv-SE' : _displayCurrency === 'USD' ? 'en-US' : 'de-DE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: _displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(converted);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
