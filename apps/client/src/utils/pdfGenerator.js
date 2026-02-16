import { jsPDF } from 'jspdf';

export const generateTaxPDF = (user, formData, result) => {
    if (!result) return;
    const doc = new jsPDF();

    // Branding
    doc.setFillColor(37, 99, 235); // Blue Header
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("OpenAudit Tax Report", 20, 25);
    
    // User Info
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated for: ${user.full_name} | Date: ${new Date().toLocaleDateString()}`, 20, 35);

    // Reset Text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);

    // Section 1: Income Details
    let y = 60;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("1. Income & Deductions", 20, y);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y+2, 190, y+2);
    
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const details = [
        [`Annual Income`, `Rs. ${Number(formData.annualIncome).toLocaleString()}`],
        [`80C Investments`, `Rs. ${Number(formData.investments || 0).toLocaleString()}`],
        [`Rent Paid (HRA)`, `Rs. ${Number(formData.rentPaid || 0).toLocaleString()}`],
        [`80D Medical`, `Rs. ${Number(formData.medical_80D || 0).toLocaleString()}`],
        [`NPS (80CCD)`, `Rs. ${Number(formData.nps_80CCD || 0).toLocaleString()}`]
    ];

    details.forEach(([label, value]) => {
        doc.text(label, 20, y);
        doc.text(value, 120, y);
        y += 8;
    });

    // Section 2: Comparison
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("2. Regime Comparison", 20, y);
    doc.line(20, y+2, 190, y+2);

    y += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Old Regime
    doc.text("Old Regime Tax:", 20, y);
    doc.text(`Rs. ${Number(result.oldRegime.tax).toLocaleString()}`, 80, y);
    
    // New Regime
    doc.text("New Regime Tax:", 120, y);
    doc.text(`Rs. ${Number(result.newRegime.tax).toLocaleString()}`, 170, y);

    // Recommendation Box
    y += 20;
    doc.setFillColor(240, 253, 244); // Light Green
    doc.setDrawColor(34, 197, 94);   // Green Border
    doc.rect(20, y, 170, 30, 'FD');
    
    doc.setFontSize(14);
    doc.setTextColor(21, 128, 61);
    doc.text(`Recommendation: ${result.recommendation}`, 105, y + 12, { align: "center" });
    
    if (result.savings > 0) {
        doc.setFontSize(10);
        doc.text(`You save Rs. ${Number(result.savings).toLocaleString()} by choosing this regime!`, 105, y + 20, { align: "center" });
    }

    doc.save("Tax_Report.pdf");
};