const auditRules = (doc) => {
    const flags = []
    const amount = parseFloat(doc.extracted_amount)||0;
    const date_str = doc.extracted_date;
    const vendor = doc.extracted_vendor || "";
    if(amount >= 20000){
        flags.push("High Amount");
    }
    if (date_str) {
        const dateObj = new Date(date_str);
        const day = dateObj.getDay(); // Returns 0 (Sun) to 6 (Sat)
        const fyStart = new Date('2025-04-01');
        const fyEnd = new Date('2026-03-31');
        
        // If the bill is too old or in the future -> Flag it.
        if (dateObj < fyStart || dateObj > fyEnd) {
            flags.push("Outside Current Financial Year");
        }
        // If it's 0 (Sun) or 6 (Sat), it's suspicious for a "Business" expense.
        if (day === 0 || day === 6) {
            flags.push("Weekend Expense (Potential Personal)");
        }
    }
    const restrictedKeywords = ['bar', 'pub', 'spa', 'movie', 'cinema', 'netflix'];
    if (restrictedKeywords.some(word => vendor.includes(word))) {
        flags.push(`Restricted Vendor Category: ${vendor}`);
    }

    return flags;
}
module.exports = { auditRules };