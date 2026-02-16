import React from 'react';

const StatsCard =({docs})=>{
    const totalSpend = docs.reduce((acc, doc) => acc + (parseFloat(doc.extracted_amount) || 0), 0);
    
    // 2. Count Flagged Docs
    const flaggedCount = docs.filter(doc => doc.audit_flags && doc.audit_flags.length > 0).length;

    // 3. Calculate "Tax Saving" Potential (Just 80C + 80D for now)
    const taxSavingDocs = docs.filter(doc => ['80C', '80D', 'HRA'].includes(doc.category));
    const totalTaxSavings = taxSavingDocs.reduce((acc, doc) => acc + (parseFloat(doc.extracted_amount) || 0), 0);

    const cardStyle = {
        background: 'white', padding: '20px', borderRadius: '10px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)', flex: 1, textAlign: 'center'
    };

    return (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={cardStyle}>
                <h3 style={{ margin: 0, color: '#666' }}>💰 Total Spend</h3>
                <h1 style={{ margin: '10px 0', color: '#333' }}>₹{totalSpend.toLocaleString()}</h1>
            </div>
            
            <div style={cardStyle}>
                <h3 style={{ margin: 0, color: '#666' }}>🛡️ Tax Deductible</h3>
                <h1 style={{ margin: '10px 0', color: 'green' }}>₹{totalTaxSavings.toLocaleString()}</h1>
            </div>

            <div style={cardStyle}>
                <h3 style={{ margin: 0, color: '#666' }}>🚩 Audit Flags</h3>
                <h1 style={{ margin: '10px 0', color: 'red' }}>{flaggedCount}</h1>
            </div>
        </div>
    );
};

export default StatsCard;