import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import logoImage from '@/assets/1903-aviation-logo.png';
import falconImage from '@/assets/aircraft-falcon-2000-lxs.png';
import g550Image from '@/assets/aircraft-gulfstream-g550.png';
import global6000Image from '@/assets/aircraft-global-6000.png';
import citationXLSImage from '@/assets/aircraft-citation-xls.png';
import challenger300Image from '@/assets/aircraft-challenger-300.png';
import challenger3500Image from '@/assets/aircraft-challenger-3500.jpg';
import praetor600Image from '@/assets/aircraft-praetor-600.jpg';
import { calculateAnnualAircraftCosts } from '@/lib/aircraftCosts';
import { type TaxJurisdiction, TAX_PRESETS } from '@/components/calculator/DepreciationModule';

const aircraftImages: Record<string, string> = {
  'citation-xls': citationXLSImage,
  'falcon-2000-lxs': falconImage,
  'bombardier-challenger-300': challenger300Image,
  'bombardier-challenger-3500': challenger3500Image,
  'embraer-praetor-600': praetor600Image,
  'gulfstream-g550': g550Image,
  'bombardier-global-6000': global6000Image,
};

const EXCLUDED_COSTS_NOTE = 'Landing, handling, parking, crew hotels, per diem, and catering are NOT included in these figures. Expect approx. 3,000-6,000 EUR per sector (outside Bromma).';

interface PdfExportProps {
  aircraft: AircraftBudget;
  captains: number;
  firstOfficers: number;
  cabinCrew: number;
  flightEngineers: number;
  owners: number;
  ownerHours: number[];
  charterHours: number;
  crewAutoAdjusted?: boolean;
  purchasePrice: number;
  depreciationYears: number;
  estimatedResaleDecline: number;
  jurisdiction: TaxJurisdiction;
  manualRate: number;
}

export const PdfExport = ({
  aircraft,
  captains,
  firstOfficers,
  cabinCrew,
  flightEngineers,
  owners,
  ownerHours,
  charterHours,
  crewAutoAdjusted,
  purchasePrice,
  depreciationYears,
  estimatedResaleDecline,
  jurisdiction,
  manualRate,
}: PdfExportProps) => {
  const generatePdf = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    const {
      totalFixedCosts,
      totalOwnerHours,
      ownerVariableCosts,
      charterRevenue,
      grossAnnualCost,
      netAnnualCost,
      effectiveHourlyCost,
      fixedCostPerOwner,
      ownerCostBreakdown,
    } = calculateAnnualAircraftCosts({
      aircraft,
      captains,
      firstOfficers,
      cabinCrew,
      flightEngineers,
      owners,
      ownerHours,
      charterHours,
    });
    
    const pdfCurrency = (amount: number) => formatCurrency(amount).replace(/\u00A0/g, ' ');

    // ── Page 1: Operating Costs ──

    // Load and add logo
    try {
      const img = new Image();
      img.src = logoImage;
      await new Promise((resolve) => { img.onload = resolve; });
      doc.addImage(img, 'PNG', 15, 10, 40, 14);
    } catch (e) {
      doc.setFontSize(18);
      doc.setTextColor(123, 27, 27);
      doc.text('1903 Aviation', 15, 20);
    }
    
    // Aircraft image
    const aircraftImageSrc = aircraftImages[aircraft.id];
    if (aircraftImageSrc) {
      try {
        const aircraftImg = new Image();
        aircraftImg.src = aircraftImageSrc;
        await new Promise((resolve) => { aircraftImg.onload = resolve; });
        doc.addImage(aircraftImg, 'PNG', pageWidth - 65, 6, 50, 22);
      } catch (e) {}
    }
    
    // Header
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 32, { align: 'right' });
    doc.text('Excl. VAT', pageWidth - 15, 37, { align: 'right' });
    
    // Title
    doc.setFontSize(14);
    doc.setTextColor(123, 27, 27);
    doc.setFont('helvetica', 'bold');
    doc.text('Aircraft Ownership Cost Summary', 15, 44);
    doc.setFont('helvetica', 'normal');
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 47, pageWidth - 15, 47);
    
    const labelColor: [number, number, number] = [100, 100, 100];
    const valueColor: [number, number, number] = [40, 40, 40];
    
    // Aircraft details
    autoTable(doc, {
      startY: 52,
      body: [
        ['Aircraft', aircraft.name, 'Range', `${aircraft.rangeNM.toLocaleString()} NM`],
        ['Operating Cost', `${pdfCurrency(aircraft.totalVariableCostPerHour)}/hr`, 'Charter Price', `${pdfCurrency(aircraft.charterPricePerHour)}/hr`],
      ],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 0, right: 8 } },
      columnStyles: {
        0: { halign: 'left', cellWidth: 32, textColor: labelColor, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 48, textColor: valueColor },
        2: { halign: 'left', cellWidth: 36, textColor: labelColor, fontStyle: 'bold' },
        3: { halign: 'left', cellWidth: 48, textColor: valueColor },
      },
      margin: { left: 15, right: 15 },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 2;

    // Configuration
    const totalHours = totalOwnerHours + charterHours;
    const crewLabel = `${captains} Capt, ${firstOfficers} FO, ${cabinCrew} Cabin, ${flightEngineers} Eng`;
    
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Owners', `${owners}`, 'Owner Hours', `${totalOwnerHours}/yr`],
        ['Charter Hours', `${charterHours}/yr`, 'Total Hours', `${totalHours}/yr`],
        ['Crew', crewLabel + (crewAutoAdjusted ? ' *' : ''), '', ''],
      ],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 0, right: 8 } },
      columnStyles: {
        0: { halign: 'left', cellWidth: 32, textColor: labelColor, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 48, textColor: valueColor },
        2: { halign: 'left', cellWidth: 36, textColor: labelColor, fontStyle: 'bold' },
        3: { halign: 'left', cellWidth: 48, textColor: valueColor },
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY;

    // Crew auto-adjustment notice
    if (crewAutoAdjusted) {
      currentY += 2;
      doc.setFontSize(7);
      doc.setTextColor(180, 120, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`* Crew increased: ${totalHours} total hours/year exceeds 400h — additional First Officer${aircraft.cabinCrewPolicy !== 'none' ? ' and Cabin Crew' : ''} added for duty time compliance.`, 15, currentY, { maxWidth: pageWidth - 30 });
      doc.setFont('helvetica', 'normal');
    }
    
    currentY += 6;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, currentY, pageWidth - 15, currentY);
    currentY += 6;

    // MAIN COST TABLE
    const costBody: string[][] = [
      ['Fixed Costs (crew, insurance, hangar, etc.)', pdfCurrency(totalFixedCosts)],
      [`Flying Costs (${totalOwnerHours}h x ${pdfCurrency(aircraft.totalVariableCostPerHour)})`, pdfCurrency(ownerVariableCosts)],
      ['Total Cost Before Charter', pdfCurrency(grossAnnualCost)],
    ];
    
    let charterRowIndex = -1;
    if (charterHours > 0) {
      charterRowIndex = costBody.length;
      costBody.push([`Charter Profit (${charterHours}h x ${pdfCurrency(aircraft.contributionMarginPerHour)})`, `- ${pdfCurrency(charterRevenue)}`]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [['Cost Breakdown', 'Amount']],
      body: costBody,
      foot: [['Your Annual Cost', pdfCurrency(netAnnualCost)]],
      theme: 'striped',
      headStyles: { fillColor: [123, 27, 27], fontSize: 9, cellPadding: 5, halign: 'left', font: 'helvetica', fontStyle: 'bold', textColor: [255, 255, 255] },
      footStyles: { fillColor: [123, 27, 27], fontSize: 11, fontStyle: 'bold', cellPadding: 6, font: 'helvetica', textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 5, font: 'helvetica', textColor: [70, 70, 70], overflow: 'linebreak', valign: 'middle' },
      columnStyles: { 
        0: { halign: 'left', cellWidth: 125 },
        1: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: 15, right: 15 },
      tableWidth: pageWidth - 30,
      didParseCell: (data) => {
        if (data.column.index === 1) data.cell.styles.halign = 'right';
        if (data.section === 'head' && data.column.index === 0) data.cell.styles.halign = 'left';
        if (data.section === 'body' && data.row.index === 2) data.cell.styles.fontStyle = 'bold';
        if (data.section === 'body' && data.row.index === charterRowIndex) data.cell.styles.textColor = [34, 120, 34];
      },
    });

    // Effective hourly cost highlight
    currentY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Your Effective Cost Per Flight Hour', 20, currentY + 8);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(`${pdfCurrency(netAnnualCost)} / ${totalOwnerHours} hours`, 20, currentY + 15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(123, 27, 27);
    doc.text(`${pdfCurrency(effectiveHourlyCost)}/hr`, pageWidth - 20, currentY + 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    // Per-Owner Breakdown
    if (owners > 1) {
      currentY += 28;
      
      const ownerData = ownerCostBreakdown.map((owner) => [
        `Owner ${owner.index + 1}`,
        `${owner.hours}`,
        pdfCurrency(fixedCostPerOwner),
        pdfCurrency(owner.variableCost),
        '-' + pdfCurrency(owner.charterShare),
        pdfCurrency(owner.totalCost),
      ]);
      
      autoTable(doc, {
        startY: currentY,
        head: [['Owner', 'Hours', 'Fixed Share', 'Variable', 'Charter', 'Net Cost']],
        body: ownerData,
        theme: 'striped',
        headStyles: { fillColor: [123, 27, 27], fontSize: 8, cellPadding: 3 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
          0: { halign: 'left', cellWidth: 22 },
          1: { halign: 'right', cellWidth: 20 },
          2: { halign: 'right', cellWidth: 32 },
          3: { halign: 'right', cellWidth: 32 },
          4: { halign: 'right', cellWidth: 32 },
          5: { halign: 'right', cellWidth: 32 },
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
      });
      currentY = (doc as any).lastAutoTable.finalY;
    }

    // ── Page 2: Investment & Depreciation ──
    doc.addPage();

    // Page 2 header
    try {
      const img = new Image();
      img.src = logoImage;
      await new Promise((resolve) => { img.onload = resolve; });
      doc.addImage(img, 'PNG', 15, 10, 40, 14);
    } catch (e) {
      doc.setFontSize(18);
      doc.setTextColor(123, 27, 27);
      doc.text('1903 Aviation', 15, 20);
    }

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 20, { align: 'right' });

    doc.setFontSize(14);
    doc.setTextColor(123, 27, 27);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment & Depreciation', 15, 36);
    doc.setFont('helvetica', 'normal');

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${aircraft.name}`, 15, 42);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 45, pageWidth - 15, 45);

    // Depreciation calculations
    const taxRate = jurisdiction === 'manual' ? manualRate / 100 : TAX_PRESETS[jurisdiction].rate / 100;
    const taxLabel = jurisdiction === 'manual' ? `${manualRate}%` : `${TAX_PRESETS[jurisdiction].rate}%`;
    const jurisdictionLabel = jurisdiction === 'manual' ? `Custom (${manualRate}%)` : TAX_PRESETS[jurisdiction].label;
    const annualDepreciation = purchasePrice / depreciationYears;
    const annualTaxSaving = annualDepreciation * taxRate;
    const totalTaxSaving = annualTaxSaving * depreciationYears;
    const estimatedResaleValue = purchasePrice * (1 - estimatedResaleDecline / 100);
    const bookValueAtSale = depreciationYears >= 10 ? 0 : purchasePrice - (annualDepreciation * Math.min(depreciationYears, 10));
    const taxableGainOnSale = Math.max(estimatedResaleValue - bookValueAtSale, 0);
    const recaptureTax = taxableGainOnSale * taxRate;
    const netTaxBenefit = totalTaxSaving - recaptureTax;

    // Configuration table
    autoTable(doc, {
      startY: 50,
      body: [
        ['Purchase Price', pdfCurrency(purchasePrice), 'Tax Jurisdiction', jurisdictionLabel],
        ['Depreciation Period', `${depreciationYears} years (straight-line)`, 'Corporate Tax Rate', taxLabel],
        ['Est. Value Decline', `${estimatedResaleDecline}% over 10 years`, '', ''],
      ],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 0, right: 8 } },
      columnStyles: {
        0: { halign: 'left', cellWidth: 36, textColor: labelColor, fontStyle: 'bold' },
        1: { halign: 'left', cellWidth: 50, textColor: valueColor },
        2: { halign: 'left', cellWidth: 36, textColor: labelColor, fontStyle: 'bold' },
        3: { halign: 'left', cellWidth: 50, textColor: valueColor },
      },
      margin: { left: 15, right: 15 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, currentY, pageWidth - 15, currentY);
    currentY += 6;

    // Tax Benefits table
    const depBody: string[][] = [
      ['Annual Tax Deduction', pdfCurrency(annualDepreciation)],
      [`Annual Tax Saving (${taxLabel})`, pdfCurrency(annualTaxSaving)],
      [`Total Tax Saving (${depreciationYears} years)`, pdfCurrency(totalTaxSaving)],
    ];
    if (owners > 1) {
      depBody.push([`Annual Tax Saving Per Owner (${owners} owners)`, pdfCurrency(annualTaxSaving / owners)]);
    }

    autoTable(doc, {
      startY: currentY,
      head: [['Tax Benefits During Ownership', 'Amount']],
      body: depBody,
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135], fontSize: 9, cellPadding: 5, fontStyle: 'bold', textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 5, textColor: [70, 70, 70] },
      columnStyles: { 
        0: { halign: 'left', cellWidth: 125 },
        1: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: 15, right: 15 },
      tableWidth: pageWidth - 30,
      didParseCell: (data) => {
        if (data.column.index === 1) data.cell.styles.halign = 'right';
        if (data.section === 'body' && data.row.index >= 1) data.cell.styles.textColor = [34, 120, 34];
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;

    // Exit Scenario table
    const exitBody: string[][] = [
      ['Book value after depreciation', pdfCurrency(Math.max(bookValueAtSale, 0))],
      ['Estimated market value at sale', pdfCurrency(estimatedResaleValue)],
      ['Taxable gain on sale (recapture)', pdfCurrency(taxableGainOnSale)],
      [`Recapture tax owed (${taxLabel})`, `- ${pdfCurrency(recaptureTax)}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Exit Scenario', 'Amount']],
      body: exitBody,
      theme: 'striped',
      headStyles: { fillColor: [146, 64, 14], fontSize: 9, cellPadding: 5, fontStyle: 'bold', textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 5, textColor: [70, 70, 70] },
      columnStyles: { 
        0: { halign: 'left', cellWidth: 125 },
        1: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: 15, right: 15 },
      tableWidth: pageWidth - 30,
      didParseCell: (data) => {
        if (data.column.index === 1) data.cell.styles.halign = 'right';
        if (data.section === 'body' && data.row.index === 3) data.cell.styles.textColor = [180, 40, 40];
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Net Tax Position highlight box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, currentY, pageWidth - 30, 26, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('Net Tax Benefit', 20, currentY + 8);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(`${pdfCurrency(totalTaxSaving)} saved - ${pdfCurrency(recaptureTax)} recapture`, 20, currentY + 15);
    if (owners > 1) {
      doc.text(`${pdfCurrency(netTaxBenefit / owners)} per owner`, 20, currentY + 21);
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 120, 34);
    doc.text(pdfCurrency(netTaxBenefit), pageWidth - 20, currentY + 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    currentY += 34;

    // Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'Note: This is a simplified illustration using straight-line depreciation. Depreciation recapture tax is calculated on the gain above book value at time of sale. Actual tax treatment depends on ownership structure, jurisdiction, accounting method, and individual circumstances. Consult your tax advisor.',
      15, currentY, { maxWidth: pageWidth - 30 }
    );
    doc.setFont('helvetica', 'normal');

    // Page 1 footer
    doc.setPage(1);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 80, 0);
    doc.text('* ' + EXCLUDED_COSTS_NOTE, 15, pageHeight - 15, { maxWidth: pageWidth - 30 });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`2026 projections. All prices excl. VAT. © ${new Date().getFullYear()} 1903 Aviation`, 15, pageHeight - 6);

    // Page 2 footer
    doc.setPage(2);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 14, pageWidth - 15, pageHeight - 14);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`2026 projections. All prices excl. VAT. © ${new Date().getFullYear()} 1903 Aviation`, 15, pageHeight - 6);
    
    const filename = `1903_${aircraft.model.replace(/\s+/g, '_')}_Cost_Summary.pdf`;
    doc.save(filename);
  };
  
  return (
    <Button onClick={generatePdf} variant="outline" className="gap-2">
      <FileDown className="w-4 h-4" />
      Export PDF
    </Button>
  );
};
