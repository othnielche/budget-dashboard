import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Printer, Eye, Download, X } from 'lucide-react';
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper to safely convert any value to string
const safeString = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return String(value);
};

// Helper to format percentage
const formatPercentage = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

const LpoPdfGenerator = ({ lpoDetails, lpoId, estateName }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = (e, shouldDownload = false) => {
    e.stopPropagation();
    
    if (!lpoDetails) {
      toast.error("LPO details not available");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Create a landscape PDF document
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text("Local Purchase Order (LPO)", pageWidth / 2, margin, { align: 'center' });
      
      // Add LPO ID and date
      doc.setFontSize(12);
      doc.text(`LPO #: ${safeString(lpoDetails.lpo?.id)}, Estate`, pageWidth / 2, margin + 8, { align: 'center' });
      
      const dateRaised = lpoDetails.lpo?.dateRaised ? 
        format(new Date(lpoDetails.lpo.dateRaised), "PPP") : 'N/A';
      doc.setFontSize(10);
      doc.text(`Date: ${dateRaised}  |  Status: ${lpoDetails.lpo?.status || 'N/A'}`, pageWidth / 2, margin + 15, { align: 'center' });
      
      // Divide the page into sections
      const sectionMargin = 5;
      const sectionWidth = (pageWidth - (2 * margin) - (2 * sectionMargin)) / 3;
      
      // Starting positions for each section
      const section1X = margin;
      const section2X = section1X + sectionWidth + sectionMargin;
      const section3X = section2X + sectionWidth + sectionMargin;
      let currentY = margin + 25;
      
      // Section 1: LPO Details
      doc.setFillColor(230, 230, 230);
      doc.rect(section1X, currentY, sectionWidth, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("LPO DETAILS", section1X + 2, currentY + 5.5);
      currentY += 12;
      
      // LPO Details content
      doc.setFontSize(9);
      const addDetailLine = (x, label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ":", x, currentY);
        doc.setFont('courier', 'normal');
        doc.text(safeString(value), x + 40, currentY);
        currentY += 6;
      };
      
      // Get LPO details safely
      const itemName = lpoDetails.item?.name || 'N/A';
      const quantity = lpoDetails.lpo?.quantityRequested || 'N/A';
      const unitSymbol = lpoDetails.item?.measuringUnit?.symbol || '';
      const quantityWithUnit = unitSymbol ? `${quantity} ${unitSymbol}` : quantity;
      const unitPrice = lpoDetails.lpo?.externalUnitCost ? 
        formatCurrency(lpoDetails.lpo.externalUnitCost) : 'N/A';
      const totalAmount = lpoDetails.lpo?.amountRequested ? 
        formatCurrency(lpoDetails.lpo.amountRequested) : 'N/A';
      const createdBy = lpoDetails.lpo?.createdBy?.name || 'N/A';
      const createdByMatricule = lpoDetails.lpo?.createdBy?.matricule || '';
      const createdByFull = createdByMatricule ? `${createdBy}` : createdBy;

      
      // Add LPO details
      currentY = margin + 25 + 12; // Reset Y position
      addDetailLine(section1X, "Item", itemName);
      addDetailLine(section1X, "Quantity", quantityWithUnit);
      addDetailLine(section1X, "Unit Price", unitPrice);
      addDetailLine(section1X, "Total Amount", totalAmount);
      addDetailLine(section1X, "Created By", createdByFull);
      addDetailLine(section1X, "Created Matricule", createdByMatricule);
      
      // Requisition details
      const reqId = lpoDetails.requisition?.id || 'N/A';
      const reqDate = lpoDetails.requisition?.dateRaised ? 
        format(new Date(lpoDetails.requisition.dateRaised), "PPP") : 'N/A';
      const reqBy = lpoDetails.requisition?.raisedBy?.name || 'N/A';
      const reqByMatricule = lpoDetails.requisition?.raisedBy?.matricule || '';
      const reqByFull = reqByMatricule ? `${reqBy} (${reqByMatricule})` : reqBy;
      
      addDetailLine(section1X, "Requisition ID", reqId);
      addDetailLine(section1X, "Requisition Date", reqDate);
      addDetailLine(section1X, "Requisition By", reqByFull);
      
      // Section 2: Budget Information
      currentY = margin + 25; // Reset Y position
      doc.setFillColor(230, 230, 230);
      doc.rect(section2X, currentY, sectionWidth, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("BUDGET INFORMATION", section2X + 2, currentY + 5.5);
      currentY += 12;
      
      // Budget Information content
      const budgetLine = lpoDetails.budgetLine?.id || 'N/A';
      const costUnit = lpoDetails.budgetLine?.costUnit?.name || 'N/A';
      const costUnitCode = lpoDetails.budgetLine?.costUnit?.code || '';
      const costUnitFull = costUnitCode ? `${costUnit} (${costUnitCode})` : costUnit;
      const costCenter = lpoDetails.budgetLine?.costUnit?.costCenter?.name || 'N/A';
      const budgetYear = lpoDetails.budgetLine?.budget?.year || 'N/A';
      
      // Budget impact
      const totalBudget = lpoDetails.budgetImpact?.totalBudgetedAmount ? 
        formatCurrency(lpoDetails.budgetImpact.totalBudgetedAmount) : 'N/A';
      const availableBudget = lpoDetails.budgetImpact?.availableBudget ? 
        formatCurrency(lpoDetails.budgetImpact.availableBudget) : 'N/A';
      const monthlyBudget = lpoDetails.budgetImpact?.currentMonthBudget ? 
        formatCurrency(lpoDetails.budgetImpact.currentMonthBudget) : 'N/A';
      const availableMonthly = lpoDetails.budgetImpact?.availableMonthlyBudget ? 
        formatCurrency(lpoDetails.budgetImpact.availableMonthlyBudget) : 'N/A';
      const projectedMonthly = lpoDetails.budgetImpact?.projectedAvailableMonthlyBudget ? 
        formatCurrency(lpoDetails.budgetImpact.projectedAvailableMonthlyBudget) : 'N/A';
      
      // Impact percentages
      const impactTotal = lpoDetails.budgetImpact?.impactOnTotalBudget !== undefined ? 
        formatPercentage(lpoDetails.budgetImpact.impactOnTotalBudget) : 'N/A';
      const impactMonthly = lpoDetails.budgetImpact?.impactOnMonthlyBudget !== undefined ? 
        formatPercentage(lpoDetails.budgetImpact.impactOnMonthlyBudget) : 'N/A';
      
      // Add budget details
      currentY = margin + 25 + 12; // Reset Y position
      addDetailLine(section2X, "Budget Line", budgetLine);
      addDetailLine(section2X, "Cost Unit", costUnitFull);
      addDetailLine(section2X, "Cost Center", costCenter);
      addDetailLine(section2X, "Budget Year", budgetYear);
      currentY += 2;
      
      addDetailLine(section2X, "Total Budget", totalBudget);
      addDetailLine(section2X, "Available Budget", availableBudget);
      addDetailLine(section2X, "Monthly Budget", monthlyBudget);
      addDetailLine(section2X, "Available Monthly", availableMonthly);
      addDetailLine(section2X, "Impact (Total)", impactTotal);
      addDetailLine(section2X, "Impact (Monthly)", impactMonthly);
      
      // Section 3: Price Comparison
      currentY = margin + 25; // Reset Y position
      doc.setFillColor(230, 230, 230);
      doc.rect(section3X, currentY, sectionWidth, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("PRICE COMPARISON", section3X + 2, currentY + 5.5);
      currentY += 12;
      
      // Price comparison content
      const internalCost = lpoDetails.priceComparison?.internalUnitCost ? 
        formatCurrency(lpoDetails.priceComparison.internalUnitCost) : 'N/A';
      const externalCost = lpoDetails.priceComparison?.externalUnitCost ? 
        formatCurrency(lpoDetails.priceComparison.externalUnitCost) : 'N/A';
      const priceDiff = lpoDetails.priceComparison?.priceDifference ? 
        formatCurrency(lpoDetails.priceComparison.priceDifference) : 'N/A';
      
      const variance = lpoDetails.priceComparison?.priceVariancePercentage;
      const isHigher = lpoDetails.priceComparison?.isExternalPriceHigher;
      let varianceText = 'N/A';
      
      if (variance !== undefined) {
        varianceText = `${variance.toFixed(2)}% ${isHigher ? 'higher' : 'lower'}`;
      }
      
      // Add price comparison details
      currentY = margin + 25 + 12; // Reset Y position
      addDetailLine(section3X, "Internal Cost", internalCost);
      addDetailLine(section3X, "External Cost", externalCost);
      addDetailLine(section3X, "Difference", priceDiff);
      addDetailLine(section3X, "Variance", varianceText);
      
      // Add comment if available
      const comment = lpoDetails.lpo?.comment;
      if (comment) {
        currentY += 4;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text("Comment:", section3X, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const commentLines = doc.splitTextToSize(comment, sectionWidth - 4);
        doc.text(commentLines, section3X, currentY);
      }
      
      // Monthly Budget Utilization Table
      currentY = 120; // Start the table lower on the page
      
      doc.setFillColor(41, 128, 185); // Blue header
      doc.rect(margin, currentY, pageWidth - (2 * margin), 8, 'F');
      
      doc.setTextColor(255, 255, 255); // White text for header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("MONTHLY BUDGET UTILIZATION", pageWidth / 2, currentY + 5.5, { align: 'center' });
      
      currentY += 12;
      
      // Check if monthly data exists
      if (lpoDetails.monthlyData && lpoDetails.monthlyData.length > 0) {
        // Table header
        const tableWidth = pageWidth - (2 * margin);
        const colWidths = [
          tableWidth * 0.2,  // Month
          tableWidth * 0.16, // Budget
          tableWidth * 0.16, // Expenditure
          tableWidth * 0.16, // Remaining
          tableWidth * 0.16, // Utilization
          tableWidth * 0.16  // Projected
        ];
        
        // Column positions (starting points)
        const colPos = [
          margin,
          margin + colWidths[0],
          margin + colWidths[0] + colWidths[1],
          margin + colWidths[0] + colWidths[1] + colWidths[2],
          margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
          margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4]
        ];
        
        // Table header
        doc.setFillColor(230, 230, 230);
        doc.rect(margin, currentY, tableWidth, 7, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        
        doc.text("Month", colPos[0] + 2, currentY + 5);
        doc.text("Budget", colPos[1] + 2, currentY + 5);
        doc.text("Expenditure", colPos[2] + 2, currentY + 5);
        doc.text("Remaining", colPos[3] + 2, currentY + 5);
        doc.text("Utilization", colPos[4] + 2, currentY + 5);
        doc.text("Projected", colPos[5] + 2, currentY + 5);
        
        currentY += 7;
        
        // Table rows
        let rowColor = false;
        lpoDetails.monthlyData.forEach((month, index) => {
          // Alternate row colors
          if (rowColor) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY, tableWidth, 7, 'F');
          }
          rowColor = !rowColor;
          
          // Month label
          doc.setFontSize(8);
          if (month.isCurrentMonth) {
            doc.setFont('helvetica', 'bold');
          } else {
            doc.setFont('helvetica', 'normal');
          }
          
          const monthLabel = `${month.month} ${month.year}${month.isCurrentMonth ? ' (Current)' : ''}`;
          doc.text(monthLabel, colPos[0] + 2, currentY + 5);
          
          // Numeric values in courier
          doc.setFont('courier', month.isCurrentMonth ? 'bold' : 'normal');
          
          const budgetAmount = month.budgetedAmount !== undefined ? 
            formatCurrency(month.budgetedAmount) : 'N/A';
          const expenditure = month.totalExpenditureAmount !== undefined ? 
            formatCurrency(month.totalExpenditureAmount) : 'N/A';
          const remaining = month.remainingBudget !== undefined ? 
            formatCurrency(month.remainingBudget) : 'N/A';
          const utilization = month.utilizationPercentage !== undefined ? 
            `${month.utilizationPercentage.toFixed(1)}%` : 'N/A';
          const projected = month.isCurrentMonth && month.projectedUtilizationWithCurrentLPO !== undefined ? 
            `${month.projectedUtilizationWithCurrentLPO.toFixed(1)}%` : '-';
          
          doc.text(budgetAmount, colPos[1] + 2, currentY + 5);
          doc.text(expenditure, colPos[2] + 2, currentY + 5);
          doc.text(remaining, colPos[3] + 2, currentY + 5);
          doc.text(utilization, colPos[4] + 2, currentY + 5);
          doc.text(projected, colPos[5] + 2, currentY + 5);
          
          currentY += 7;
          
          // If we're running out of space, add a new page
          if (currentY > pageHeight - 20 && index < lpoDetails.monthlyData.length - 1) {
            doc.addPage();
            currentY = margin;
            
            // Redraw the table header on the new page
            doc.setFillColor(41, 128, 185);
            doc.rect(margin, currentY, pageWidth - (2 * margin), 8, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text("MONTHLY BUDGET UTILIZATION (Continued)", pageWidth / 2, currentY + 5.5, { align: 'center' });
            
            currentY += 12;
            
            // Redraw column headers
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, currentY, tableWidth, 7, 'F');
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            
            doc.text("Month", colPos[0] + 2, currentY + 5);
            doc.text("Budget", colPos[1] + 2, currentY + 5);
            doc.text("Expenditure", colPos[2] + 2, currentY + 5);
            doc.text("Remaining", colPos[3] + 2, currentY + 5);
            doc.text("Utilization", colPos[4] + 2, currentY + 5);
            doc.text("Projected", colPos[5] + 2, currentY + 5);
            
            currentY += 7;
            rowColor = false;
          }
        });
      } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text("No monthly data available", margin + 2, currentY + 5);
      }
      
      // Add footer with generation date on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Generated on ${format(new Date(), "PPP 'at' p")} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }
      
      // If we're just previewing, convert to data URL and open preview
      if (!shouldDownload) {
        const pdfDataUrl = doc.output('datauristring');
        setPdfData(pdfDataUrl);
        
        // Also create a blob for download button in preview
        const pdfBlob = doc.output('blob');
        setPdfBlob(pdfBlob);
        
        setPreviewOpen(true);
      } else {
        // Save the PDF
        doc.save(`LPO-${lpoDetails.lpo?.id || 'unknown'}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
        toast.success("PDF downloaded successfully");
      }
      
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LPO-${lpoDetails.lpo?.id || 'unknown'}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    }
  };

  return (
    <>
      <Button 
        onClick={(e) => generatePDF(e, false)}
        className="bg-gray-600 hover:bg-gray-700 flex-1"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </>
        )}
      </Button>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen} className="bg-gray-900">
        <DialogContent className="max-w-full h-full flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>PDF Preview - LPO for {lpoDetails?.item?.name} - {estateName}</span>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto bg-gray-700 ">
            {pdfData && (
              <iframe 
                src={pdfData} 
                className="w-full h-full border-0"
                title="LPO Preview"
              />
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              onClick={handleDownload}
              className="bg-slate-950 hover:bg-slate-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Download LPO Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LpoPdfGenerator; 