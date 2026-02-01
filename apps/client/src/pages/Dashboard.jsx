import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jsPDF} from 'jspdf';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        annualIncome: '',
        investments: '',    // Section 80C (PPF, LIC, etc.)
        otherDeductions: '', // Section 80D (Health Insurance)
        rentPaid: '',        // For HRA Calculation
        // ADVANCED FIELDS (Initially Hidden)
        medical_80D : '',
        nps_80CCD : '',
        education_80E : '',
        professional_tax :'',
        hra_received :''
    });
    const [showAdvanced, setShowAdvance] = useState(false);

    const [result, setResult] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/auth/me')
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                navigate('/login');
            });
        api.get('/tax/history')
            .then((res) => {
                setHistory(res.data.history);
            })
            .catch((err) => {
                console.error("Error fetching history:", err);
            });
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- HANDLE CALCULATION (Placeholder for now) ---
    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        api.post('/tax/calculate', formData)
            .then((res) => {
                toast.success("Calculation Complete!" + res.data.recommendation);
                setResult(res.data);
                setLoading(false);
                if(res.data.savedRecord) {
                    setHistory([res.data.savedRecord, ...history]); 
                }
            })
            .catch((err) => {
                toast.error("Error calculating tax");
                setLoading(false);
            });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');    
    }
    const downloadPDF = () => {
        if (!result) return;

        const doc = new jsPDF();
        
        // --- HEADER ---
        doc.setFontSize(20);
        doc.setTextColor(40, 167, 69); // Green color
        doc.text("OpenAudit Tax Report IN", 20, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`User: ${user.full_name}`, 20, 36);

        // --- LINE ---
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // --- INPUTS SUMMARY ---
        doc.setFontSize(14);
        doc.text("Income Details", 20, 55);
        
        doc.setFontSize(10);
        doc.text(`Annual Income: Rs. ${Number(formData.annualIncome).toLocaleString()}`, 20, 65);
        doc.text(`Investments (80C): Rs. ${Number(formData.investments || 0).toLocaleString()}`, 20, 71);
        doc.text(`Rent Paid: Rs. ${Number(formData.rentPaid || 0).toLocaleString()}`, 20, 77);
        doc.text(`Medical (80D): Rs. ${Number(formData.medical_80D || 0).toLocaleString()}`, 20, 83);
        doc.text(`NPS (80CCD): Rs. ${Number(formData.nps_80CCD || 0).toLocaleString()}`, 20, 89);

        // --- RESULT COMPARISON ---
        doc.setFontSize(14);
        doc.text("Tax Calculation Results", 110, 55);

        // Old Regime
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Old Regime", 110, 65);
        doc.setTextColor(0, 0, 0);
        doc.text(`Taxable Income: Rs. ${Number(result.oldRegime.taxableIncome).toLocaleString()}`, 110, 71);
        doc.text(`Tax Payable: Rs. ${Number(result.oldRegime.tax).toLocaleString()}`, 110, 77);

        // New Regime
        doc.setTextColor(100, 100, 100);
        doc.text("New Regime", 110, 90);
        doc.setTextColor(0, 0, 0);
        doc.text(`Taxable Income: Rs. ${Number(result.newRegime.taxableIncome).toLocaleString()}`, 110, 96);
        doc.text(`Tax Payable: Rs. ${Number(result.newRegime.tax).toLocaleString()}`, 110, 102);

        // --- WINNER BOX ---
        doc.setDrawColor(40, 167, 69); // Green border
        doc.rect(20, 120, 170, 30); // Draw box
        
        doc.setFontSize(16);
        doc.setTextColor(40, 167, 69);
        doc.text(`Recommendation: ${result.recommendation}`, 105, 135, { align: "center" });
        
        if (result.savings > 0) {
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`You save Rs. ${Number(result.savings).toLocaleString()}!`, 105, 143, { align: "center" });
        }

        doc.save("Tax_Report.pdf");
    };

    if (!user) return <div style={styles.loading}>Loading your Tax Profile...</div>;

    return (
        <div style={styles.container}>
            {/* TOP BAR */}
            <header style={styles.header}>
                <h2>OpenAudit 🇮🇳</h2>
                <div style={styles.userInfo}>
                    <span>Welcome, <strong>{user.full_name || "User"}</strong></span>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </header>

            {/* MAIN CONTENT GRID */}
            <div style={styles.grid}>
                
                {/* LEFT COLUMN: The Calculator */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>💰 New Tax Calculation</h3>
                    <form onSubmit={handleCalculate}>
                        
                        <div style={styles.inputGroup}>
                            <label>Annual Income (₹)</label>
                            <input 
                                type="number" 
                                name="annualIncome" 
                                placeholder="e.g. 1200000" 
                                value={formData.annualIncome}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label>Section 80C Investments (₹)</label>
                            <small style={{color: '#666'}}>PPF, LIC, EPF (Max 1.5L)</small>
                            <input 
                                type="number" 
                                name="investments" 
                                placeholder="e.g. 150000" 
                                value={formData.investments}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label>Rent Paid Yearly (₹)</label>
                            <small style={{color: '#666'}}>Needed for HRA Exemption</small>
                            <input 
                                type="number" 
                                name="rentPaid" 
                                placeholder="e.g. 240000" 
                                value={formData.rentPaid}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label>Other Deductions (₹)</label>
                            <small style={{color: '#666'}}>Section 80D (Medical), etc.</small>
                            <input 
                                type="number" 
                                name="otherDeductions" 
                                placeholder="e.g. 25000" 
                                value={formData.otherDeductions}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                        <div style={{marginBottom: '20px', textAlign: 'center'}}>
                            <button 
                                type="button" 
                                onClick={() => setShowAdvance(!showAdvanced)}
                                style={{
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#007bff', 
                                    cursor: 'pointer', 
                                    textDecoration: 'underline',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {showAdvanced ? "Hide Advanced Options 🔼" : "Show Advanced Options 🔽"}
                            </button>
                        </div>

                        {/* --- HIDDEN FIELDS --- */}
                        {showAdvanced && (
                            <div style={{
                                backgroundColor: '#f8f9fa', 
                                padding: '15px', 
                                borderRadius: '8px', 
                                marginBottom: '20px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h4 style={{marginTop: 0, color: '#444'}}>🧪 Granular Deductions</h4>
                                
                                <div style={styles.inputGroup}>
                                    <label>Medical Insurance (80D) ₹</label>
                                    <small style={{color: '#666'}}>Self + Parents</small>
                                    <input 
                                        type="number" 
                                        name="medical_80D" 
                                        placeholder="e.g. 25000" 
                                        value={formData.medical_80D} 
                                        onChange={handleChange} 
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>NPS Contribution (80CCD 1B) ₹</label>
                                    <small style={{color: '#666'}}>Extra 50k deduction</small>
                                    <input 
                                        type="number" 
                                        name="nps_80CCD" 
                                        placeholder="e.g. 50000" 
                                        value={formData.nps_80CCD} 
                                        onChange={handleChange} 
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label>Education Loan Interest (80E) ₹</label>
                                    <small style={{color: '#666'}}>Unlimited deduction on interest</small>
                                    <input 
                                        type="number" 
                                        name="education_80E" 
                                        placeholder="e.g. 12000" 
                                        value={formData.education_80E} 
                                        onChange={handleChange} 
                                        style={styles.input}
                                    />
                                </div>
                                
                                <div style={styles.inputGroup}>
                                    <label>Professional Tax ₹</label>
                                    <small style={{color: '#666'}}>Usually ₹200/month (₹2400)</small>
                                    <input 
                                        type="number" 
                                        name="professional_tax" 
                                        placeholder="e.g. 2400" 
                                        value={formData.professional_tax} 
                                        onChange={handleChange} 
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" style={styles.calculateBtn} disabled={loading}>
                            {loading ? 'Calculating...' : 'Calculate Tax'}
                        </button>
                    </form>
                    {result && (
                        <div style={styles.resultBox}>
                            <h4 style={{marginTop: 0, textAlign: 'center'}}>📊 Analysis Result</h4>
                            
                            <div style={styles.comparisonGrid}>
                                {/* Old Regime Box */}
                                <div style={styles.regimeBox}>
                                    <strong>Old Regime</strong>
                                    <div style={{fontSize: '1.2rem', color: '#555'}}>
                                        ₹{result.oldRegime.tax.toLocaleString()}
                                    </div>
                                    <small>Taxable: ₹{result.oldRegime.taxableIncome.toLocaleString()}</small>
                                </div>

                                {/* New Regime Box */}
                                <div style={styles.regimeBox}>
                                    <strong>New Regime</strong>
                                    <div style={{fontSize: '1.2rem', color: '#555'}}>
                                        ₹{result.newRegime.tax.toLocaleString()}
                                    </div>
                                    <small>Taxable: ₹{result.newRegime.taxableIncome.toLocaleString()}</small>
                                </div>
                            </div>

                            {/* The Winner Banner */}
                            <div style={{
                                ...styles.recommendation, 
                                backgroundColor: result.recommendation === "Old Regime" ? '#e6fffa' : '#ebf8ff',
                                color: result.recommendation === "Old Regime" ? '#2c7a7b' : '#2b6cb0'
                            }}>
                                💡 We recommend: <strong>{result.recommendation}</strong>
                                {result.savings > 0 && (
                                    <div>You will save <strong>₹{result.savings.toLocaleString()}</strong>!</div>
                                )}
                                <button 
                                    onClick={downloadPDF}
                                    style={{
                                        marginTop: '15px',
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#333',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                📥 Download PDF Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: History */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📜 Past Calculations</h3>
                    
                    {history?.length === 0 ? (
                        <div style={styles.emptyState}>No records found yet.</div>
                    ) : (
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {history?.map((record) => (
                                <div key={record.id} style={styles.historyItem}>
                                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <strong>{new Date(record.created_at).toLocaleDateString()}</strong>
                                        <span style={{
                                            color: record.recommendation === 'Old Regime' ? '#2c7a7b' : '#2b6cb0',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            backgroundColor: record.recommendation === 'Old Regime' ? '#e6fffa' : '#ebf8ff',
                                            padding: '2px 8px',
                                            borderRadius: '10px'
                                        }}>
                                            {record?.recommendation}
                                        </span>
                                    </div>
                                    <div style={{fontSize: '0.9rem', color: '#666', marginTop: '5px'}}>
                                        Income: ₹{Number(record?.annualincome).toLocaleString()}
                                    </div>
                                    <div style={{fontSize: '0.8rem', color: '#888'}}>
                                        Savings: ₹{Number(record?.savings).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// --- STYLES (Clean & Professional) ---
const styles = {
    container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    loading: { textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#555' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', borderBottom: '1px solid #ddd' },
    userInfo: { display: 'flex', gap: '15px', alignItems: 'center' },
    logoutBtn: { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' },
    
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
    
    card: { backgroundColor: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
    cardTitle: { marginTop: 0, borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px' },
    
    inputGroup: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem' },
    
    calculateBtn: { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
    
    emptyState: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', textAlign: 'center', color: '#aaa' },
    resultBox: { marginTop: '20px', padding: '15px', borderTop: '2px dashed #ddd', animation: 'fadeIn 0.5s' },
    comparisonGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
    regimeBox: { backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px', textAlign: 'center', border: '1px solid #eee' },
    recommendation: { marginTop: '15px', padding: '10px', borderRadius: '5px', textAlign: 'center', border: '1px solid currentColor' },
    historyItem: { borderBottom: '1px solid #eee', padding: '10px 0' }
};

export default Dashboard;