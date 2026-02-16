import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../api/axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/tax/history')
            .then(res => setHistory(res.data.history || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '40px', background: '#f9fafb', minHeight: '100vh' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>← Back to Dashboard</Link>
            <h2 style={{ marginTop: '20px', marginBottom: '30px' }}>📜 Calculation History</h2>

            {loading ? <p>Loading...</p> : (
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f3f4f6' }}>
                            <tr>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Annual Income</th>
                                <th style={thStyle}>Old Regime Tax</th>
                                <th style={thStyle}>New Regime Tax</th>
                                <th style={thStyle}>Recommendation</th>
                                <th style={thStyle}>Savings</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr><td colSpan="6" style={{padding:'30px', textAlign:'center', color:'#999'}}>No history found.</td></tr>
                            ) : history.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={tdStyle}>{new Date(row.created_at).toLocaleDateString()}</td>
                                    <td style={tdStyle}>₹{Number(row.annualincome).toLocaleString()}</td>
                                    <td style={tdStyle}>₹{Number(row.old_regime_tax).toLocaleString()}</td>
                                    <td style={tdStyle}>₹{Number(row.new_regime_tax).toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            background: row.recommendation === 'Old Regime' ? '#e0f2fe' : '#dcfce7',
                                            color: row.recommendation === 'Old Regime' ? '#0369a1' : '#15803d',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold'
                                        }}>
                                            {row.recommendation}
                                        </span>
                                    </td>
                                    <td style={{...tdStyle, color: 'green', fontWeight:'bold'}}>
                                        {row.savings > 0 ? `₹${Number(row.savings).toLocaleString()}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const thStyle = { padding: '15px', textAlign: 'left', color: '#555', fontSize: '0.9rem', textTransform: 'uppercase' };
const tdStyle = { padding: '15px', color: '#333' };

export default History;