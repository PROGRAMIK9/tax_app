import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
    // 1. User Profile State
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // 2. Tax Form State (The inputs)
    const [formData, setFormData] = useState({
        annualIncome: '',
        investments: '',    // Section 80C (PPF, LIC, etc.)
        otherDeductions: '', // Section 80D (Health Insurance)
        rentPaid: ''        // For HRA Calculation
    });

    const [loading, setLoading] = useState(false);

    // --- FETCH USER ON LOAD ---
    useEffect(() => {
        api.get('/auth/me')
            .then((res) => {
                // We handle the nested 'user' object here just in case, or direct access
                // Depending on your fix, it might be res.data or res.data.user
                setUser(res.data);
            })
            .catch(() => {
                navigate('/login');
            });
    }, []);

    // --- HANDLE INPUT CHANGES ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- HANDLE CALCULATION (Placeholder for now) ---
    const handleCalculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // We will connect this to the backend in the next step!
        console.log("Sending to server:", formData);
        
        // Simulating a delay so you can see the loading state
        api.post('/tax/calculate', formData)
            .then((res) => {
                toast.success("Calculation Complete!" + res.data.recommendation);
                console.log("Tax Calculation Result:", res.data.message,res.data.recommendation);
                setLoading(false);
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

                        <button type="submit" style={styles.calculateBtn} disabled={loading}>
                            {loading ? 'Calculating...' : 'Calculate Tax'}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: History (Placeholder) */}
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>📜 Past Calculations</h3>
                    <p style={{color: '#777'}}>Your recent tax records will appear here.</p>
                    <div style={styles.emptyState}>
                        No records found.
                    </div>
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
    
    emptyState: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', textAlign: 'center', color: '#aaa' }
};

export default Dashboard;