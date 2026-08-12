import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type AircraftBudget, formatCurrency } from '@/data/aircraftData';
import logoImage from '@/assets/1903-aviation-logo.png';
import falconImage from '@/assets/aircraft-falcon-2000-lxs.png';
import g550Image from '@/assets/aircraft-gulfstream-g550.png';
import global6000Image from '@/assets/aircraft-global-6000.png';
import global6500Image from '@/assets/aircraft-global-6500.jpg';
import citationXLSImage from '@/assets/aircraft-citation-xls.png';
import challenger300Image from '@/assets/aircraft-challenger-300.png';
import challenger3500Image from '@/assets/aircraft-challenger-3500.jpg';
import praetor600Image from '@/assets/aircraft-praetor-600.jpg';
import { calculateDefaultComparisonCosts } from '@/lib/aircraftCosts';

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

const EXCLUDED_COSTS_NOTE = 'Landing, handling, parking, crew hotels, per diem, and catering are NOT included. Expect approx. 3,000-6,000 EUR per sector (outside Bromma).';

interface ComparisonPdfExportProps {
  aircraft1: AircraftBudget;
  aircraft2: AircraftBudget;
  ownerHours: number;
  charterHours: number;
}

export const ComparisonPdfExport = ({
  aircraft1,
  aircraft2,
  ownerHours,
  charterHours,
}: ComparisonPdfExportProps) => {
  const generatePdf = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    const costs1Base = calculateDefaultComparisonCosts({ aircraft: aircraft1, ownerHours, charterHours });
    const costs2Base = calculateDefaultComparisonCosts({ aircraft: aircraft2, ownerHours, charterHours });

    const costs1 = {
      fixedCosts: costs1Base.totalFixedCosts,
      variableCostPerHour: costs1Base.variableCostPerHour,
      charterMargin: costs1Base.charterMargin,
      charterRevenue: costs1Base.charterRevenue,
      netAnnualCost: costs1Base.netAnnualCost,
      effectiveHourlyCost: costs1Base.effectiveHourlyCost,
      fuelConsumption: costs1Base.fuelConsumption,
      cabinHeight: costs1Base.cabinHeight,
      rangeNM: costs1Base.rangeNM,
      passengerCapacity: costs1Base.passengerCapacity,
    };
    const costs2 = {
      fixedCosts: costs2Base.totalFixedCosts,
      variableCostPerHour: costs2Base.variableCostPerHour,
      charterMargin: costs2Base.charterMargin,
      charterRevenue: costs2Base.charterRevenue,
      netAnnualCost: costs2Base.netAnnualCost,
      effectiveHourlyCost: costs2Base.effectiveHourlyCost,
      fuelConsumption: costs2Base.fuelConsumption,
      cabinHeight: costs2Base.cabinHeight,
      rangeNM: costs2Base.rangeNM,
      passengerCapacity: costs2Base.passengerCapacity,
    };
    
    const pdfCurrency = (amount: number) => formatCurrency(amount).replace(/\u00A0/g, ' ');
    
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
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 15, 14, { align: 'right' });
    doc.text('Excl. VAT', pageWidth - 15, 19, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text('Aircraft Comparison', 15, 30);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 33, pageWidth - 15, 33);
    
    let currentY = 38;
    const imageWidth = 38;
    const imageHeight = 17;
    const tableStartX = 15;
    const labelColumnWidth = 55;
    const dataColumnWidth = 60;
    const col1CenterX = tableStartX + labelColumnWidth + (dataColumnWidth / 2);
    const col2CenterX = tableStartX + labelColumnWidth + dataColumnWidth + (dataColumnWidth / 2);
    const image1X = col1CenterX - imageWidth / 2;
    const image2X = col2CenterX - imageWidth / 2;
    
    const aircraft1ImageSrc = aircraftImages[aircraft1.id];
    if (aircraft1ImageSrc) {
      try {
        const img1 = new Image();
        img1.src = aircraft1ImageSrc;
        await new Promise((resolve) => { img1.onload = resolve; });
        doc.addImage(img1, 'PNG', image1X, currentY, imageWidth, imageHeight);
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(aircraft1.model, col1CenterX, currentY + imageHeight + 3, { align: 'center' });
      } catch (e) {}
    }
    
    const aircraft2ImageSrc = aircraftImages[aircraft2.id];
    if (aircraft2ImageSrc) {
      try {
        const img2 = new Image();
        img2.src = aircraft2ImageSrc;
        await new Promise((resolve) => { img2.onload = resolve; });
        doc.addImage(img2, 'PNG', image2X, currentY, imageWidth, imageHeight);
        doc.setFontSize(7);
        doc.setTextColor(80, 80, 80);
        doc.text(aircraft2.model, col2CenterX, currentY + imageHeight + 3, { align: 'center' });
      } catch (e) {}
    }
    
    currentY += imageHeight + 8;
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Owner Hours: ${ownerHours}/yr  •  Charter Hours: ${charterHours}/yr  •  Total: ${ownerHours + charterHours}/yr`, 15, currentY);
    
    currentY += 5;
    
    const ownerVariable1 = costs1.variableCostPerHour * ownerHours;
    const ownerVariable2 = costs2.variableCostPerHour * ownerHours;
    const ownerTotalBeforeCharter1 = costs1.fixedCosts + ownerVariable1;
    const ownerTotalBeforeCharter2 = costs2.fixedCosts + ownerVariable2;
    const netCost1 = ownerTotalBeforeCharter1 - costs1.charterRevenue;
    const netCost2 = ownerTotalBeforeCharter2 - costs2.charterRevenue;
    const hourlyCost1 = ownerHours > 0 ? netCost1 / ownerHours : 0;
    const hourlyCost2 = ownerHours > 0 ? netCost2 / ownerHours : 0;

    autoTable(doc, {
      startY: currentY,
      head: [['Cost Breakdown', aircraft1.model, aircraft2.model]],
      body: [
        ['Fixed Costs', pdfCurrency(costs1.fixedCosts), pdfCurrency(costs2.fixedCosts)],
        [`Flying Costs (${ownerHours}h)`, pdfCurrency(ownerVariable1), pdfCurrency(ownerVariable2)],
        ['Total Cost Before Charter', pdfCurrency(ownerTotalBeforeCharter1), pdfCurrency(ownerTotalBeforeCharter2)],
        [`Charter Profit (${charterHours}h)`, pdfCurrency(costs1.charterRevenue), pdfCurrency(costs2.charterRevenue)],
        ['Your Annual Cost', pdfCurrency(netCost1), pdfCurrency(netCost2)],
        [`Effective Hourly Cost (${ownerHours}h)`, pdfCurrency(hourlyCost1), pdfCurrency(hourlyCost2)],
      ],
      theme: 'plain',
      headStyles: { fillColor: [245, 245, 245], fontSize: 8, cellPadding: 3, halign: 'left', textColor: [80, 80, 80] },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 
        0: { cellWidth: 55, halign: 'left' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
      didParseCell: function(data) {
        if (data.row.index === 2) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [250, 250, 250]; }
        if (data.row.index === 3) { data.cell.styles.textColor = [34, 139, 34]; }
        if (data.row.index === 4) { data.cell.styles.fontStyle = 'bold'; data.cell.styles.fillColor = [123, 27, 27]; data.cell.styles.textColor = [255, 255, 255]; }
        if (data.row.index === 5) { data.cell.styles.fontStyle = 'italic'; data.cell.styles.textColor = [100, 100, 100]; }
      },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: currentY,
      head: [['Specifications', aircraft1.model, aircraft2.model]],
      body: [
        ['Passengers', `${costs1.passengerCapacity} pax`, `${costs2.passengerCapacity} pax`],
        ['Range', `${costs1.rangeNM.toLocaleString()} NM`, `${costs2.rangeNM.toLocaleString()} NM`],
        ['Cabin Height', `${costs1.cabinHeight.toFixed(2)} m`, `${costs2.cabinHeight.toFixed(2)} m`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [100, 100, 100], fontSize: 8, cellPadding: 3, halign: 'left' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 
        0: { cellWidth: 55, halign: 'left' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 50, halign: 'right' },
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
    });
    
    const pageHeight = doc.internal.pageSize.height;
    const footerStartY = pageHeight - 35;
    const tableEndY = (doc as any).lastAutoTable.finalY + 5;
    const summaryBoxY = Math.min(tableEndY, footerStartY - 25);
    
    const difference = Math.abs(costs1.netAnnualCost - costs2.netAnnualCost);
    const cheaperAircraft = costs1.netAnnualCost < costs2.netAnnualCost ? aircraft1.model : aircraft2.model;
    
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(15, summaryBoxY, pageWidth - 30, 18, 2, 2, 'FD');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Annual Savings', pageWidth / 2, summaryBoxY + 6, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`${cheaperAircraft} saves ${pdfCurrency(difference)}/year`, pageWidth / 2, summaryBoxY + 13, { align: 'center' });
    doc.setFont(undefined, 'normal');
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 30, pageWidth - 15, pageHeight - 30);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(180, 80, 0);
    doc.text('* ' + EXCLUDED_COSTS_NOTE, 15, pageHeight - 23, { maxWidth: pageWidth - 30 });
    
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Uses default crew configuration. Estimates based on 2026 projections. All prices excl. VAT.`, 15, pageHeight - 12, { maxWidth: pageWidth - 30 });
    doc.text(`© ${new Date().getFullYear()} 1903 Aviation`, 15, pageHeight - 7);
    
    const filename = `1903_Comparison_${aircraft1.model.replace(/\s+/g, '_')}_vs_${aircraft2.model.replace(/\s+/g, '_')}.pdf`;
    doc.save(filename);
  };
  
  return (
    <Button onClick={generatePdf} variant="outline" size="sm" className="gap-2">
      <FileDown className="w-4 h-4" />
      Export Comparison
    </Button>
  );
};
