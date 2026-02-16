import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../api/axios';
import toast from 'react-hot-toast';
import { generateTaxPDF } from '../utils/pdfGenerator'; 

const Calculator = () => {
    const [user, setUser] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        annualIncome: '', investments: '', otherDeductions: '', rentPaid: '',
        medical_80D: '', nps_80CCD: '', education_80E: '', professional_tax: '', hra_received: ''
    });

    useEffect(() => {
        api.get('/auth/me').then(res => setUser(res.data));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCalculate = async (e) => {
        e.preventDefault();
        setCalculating(true);
        try {
            const res = await api.post('/tax/calculate', formData);
            setResult(res.data);
            toast.success("Calculated Successfully!");
        } catch (err) {
            toast.error("Calculation failed.");
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.navbar}>
                <Link to="/" style={styles.backLink}>← Back to Dashboard</Link>
                <h2>🧮 Tax Calculator</h2>
                <div style={{width: '100px'}}></div> {/* Spacer */}
            </div>

            <div style={styles.container}>
                <div style={styles.card}>
                    <form onSubmit={handleCalculate} style={styles.formGrid}>
                        <div style={styles.column}>
                            <h4>Basic Details</h4>
                            <InputGroup label="Annual Income (₹)" name="annualIncome" val={formData.annualIncome} onChange={handleChange} required />
                            <InputGroup label="80C Investments (PPF/LIC)" name="investments" val={formData.investments} onChange={handleChange} />
                            <InputGroup label="Rent Paid (For HRA)" name="rentPaid" val={formData.rentPaid} onChange={handleChange} />
                        </div>

                        <div style={styles.column}>
                             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h4>Advanced Deductions</h4>
                                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} style={styles.toggleBtn}>
                                    {showAdvanced ? "Hide" : "Show"}
                                </button>
                             </div>
                             
                             {showAdvanced && (
                                <div style={styles.fadeIn}>
                                    <InputGroup label="Medical (80D)" name="medical_80D" val={formData.medical_80D} onChange={handleChange} />
                                    <InputGroup label="NPS (80CCD)" name="nps_80CCD" val={formData.nps_80CCD} onChange={handleChange} />
                                    <InputGroup label="Edu Loan (80E)" name="education_80E" val={formData.education_80E} onChange={handleChange} />
                                </div>
                             )}
                        </div>
                    </form>
                    
                    <button onClick={handleCalculate} style={styles.calculateBtn} disabled={calculating}>
                        {calculating ? "Calculating..." : "Run Tax Analysis"}
                    </button>

                    {/* RESULT SECTION */}
                    {result && (
                        <div style={styles.resultBox}>
                            <h3>Analysis Result</h3>
                            <div style={styles.compareGrid}>
                                <div style={styles.regimeCard}>Old Regime: <strong>₹{result.oldRegime.tax.toLocaleString()}</strong></div>
                                <div style={styles.regimeCard}>New Regime: <strong>₹{result.newRegime.tax.toLocaleString()}</strong></div>
                            </div>
                            <div style={styles.recommendation}>
                                🌟 Recommended: <strong>{result.recommendation}</strong>
                                {result.savings > 0 && <span> (Save ₹{result.savings.toLocaleString()})</span>}
                            </div>
                            <button onClick={() => generateTaxPDF(user, formData, result)} style={styles.pdfBtn}>Download PDF Report</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper Input Component
const InputGroup = ({ label, name, val, onChange, required }) => (
    <div style={{marginBottom: '15px'}}>
        <label style={{display:'block', marginBottom:'5px', color:'#555', fontSize:'0.9rem'}}>{label}</label>
        <input type="number" name={name} value={val} onChange={onChange} required={required} style={styles.input} />
    </div>
);

const styles = {
    page: { background: '#f3f4f6', minHeight: '100vh', padding: '20px' },
    navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    backLink: { textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' },
    container: { maxWidth: '800px', margin: '0 auto' },
    card: { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing:'border-box' },
    calculateBtn: { width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' },
    toggleBtn: { background:'none', border:'none', color:'#2563eb', cursor:'pointer' },
    resultBox: { marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed #eee', textAlign: 'center' },
    compareGrid: { display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0' },
    regimeCard: { padding: '15px', background: '#f9fafb', borderRadius: '8px', minWidth: '150px' },
    recommendation: { padding: '15px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '15px' },
    pdfBtn: { padding: '10px 20px', background: '#374151', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};

export default Calculator;