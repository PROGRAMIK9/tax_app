import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import FileUpload from '../components/FileUpload';
import api from '../api/axios';

// Components
import StatsCards from '../components/StatsCard';
import CategoryChart from '../components/CategoryChart';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [userRes, docsRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/documents')
                ]);
                setUser(userRes.data);
                setDocs(docsRes.data || []);
            } catch (error) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleUploadSuccess = (newDoc) => {
        setDocs([newDoc, ...docs]); // Add new file to list instantly
        setShowUpload(false);       // Close popup
    };

    if (loading) return <div style={styles.loader}>Loading...</div>;

    return (
        <div style={styles.page}>
            {/* NAV (Ideally move this to a shared component) */}
            <nav style={styles.navbar}>
                <div style={styles.brand}>OpenAudit 🇮🇳</div>
                <div style={styles.navRight}>
                    <Link to="/" style={styles.activeLink}>Home</Link>
                    <Link to="/calculator" style={styles.link}>Calculator</Link>
                    <Link to="/history" style={styles.link}>History</Link>
                    <Link to="/files" style={styles.link}>Files</Link>

                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                </div>
            </nav>

            <div style={styles.container}>
                {/* WELCOME HEADER */}
                <div style={styles.header}>
                    <h2>👋 Welcome back, {user?.full_name}</h2>
                    <p style={{ color: '#666' }}>Here is your financial snapshot.</p>
                </div>

                {/* 1. STATS ROW */}
                <StatsCards docs={docs} />

                {/* 2. MAIN GRID */}
                <div style={styles.grid}>

                    {/* CHART SECTION */}
                    <div style={styles.card}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📊 Spending Breakdown</h3>

                        {/* Give the parent a fixed height. The chart will fill this EXACTLY. */}
                        <div style={{ height: '300px', width: '100%', position: 'relative' }}>
                            {docs.length > 0 ? (
                                <CategoryChart docs={docs} />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    No spending data yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div style={styles.actionGrid}>
                        <Link to="/calculator" style={{ ...styles.actionCard, background: '#e0f2fe', color: '#0369a1' }}>
                            <div style={{ fontSize: '2rem' }}>🧮</div>
                            <strong>Calculate Tax</strong>
                            <small>Compare Regimes</small>
                        </Link>

                        <div
                            onClick={() => setShowUpload(true)}
                            style={{ ...styles.actionCard, background: '#dcfce7', color: '#15803d', cursor: 'pointer' }}
                        >
                            <div style={{ fontSize: '2rem' }}>📤</div>
                            <strong>Upload Receipt</strong>
                            <small>Click to scan</small>
                        </div>

                        <Link to="/history" style={{ ...styles.actionCard, background: '#f3f4f6', color: '#374151' }}>
                            <div style={{ fontSize: '2rem' }}>📜</div>
                            <strong>View History</strong>
                            <small>Past Records</small>
                        </Link>
                    </div>

                </div>
            </div>
            {showUpload && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>📤 Upload Document</h3>
                            <button onClick={() => setShowUpload(false)} style={styles.closeBtn}>×</button>
                        </div>

                        {/* 5. YOUR EXISTING COMPONENT */}
                        <div style={{ padding: '20px' }}>
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    page: { backgroundColor: '#f9fafb', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    navbar: { backgroundColor: '#fff', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' },
    brand: { fontSize: '1.5rem', fontWeight: 'bold' },
    navRight: { display: 'flex', gap: '20px', alignItems: 'center' },
    link: { textDecoration: 'none', color: '#6b7280', fontWeight: '500' },
    activeLink: { textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' },
    logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' },
    container: { maxWidth: '1200px', margin: '30px auto', padding: '0 20px' },
    header: { marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' },
    card: { background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' },
    actionGrid: { display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: '15px' },
    actionCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', transition: 'transform 0.2s', border: '1px solid transparent' },
    loader: { display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '0', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden' },
    modalHeader: { padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' },
    closeBtn: { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }
};

export default Dashboard;