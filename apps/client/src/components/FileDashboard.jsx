import {useState, useEffect} from 'react';
import api from '../api/axios';
import FileUpload from './FileUpload';
const FiledDashboard = () => {
    const [docs, setDocs] = useState(null);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({});  
    const [showUpload, setShowUpload] = useState(false); 
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const queryParams = new URLSearchParams({
                    search: search,
                    category: categoryFilter
                }).toString();
                const res = await api.get(`/documents?${queryParams? queryParams : ''}`); 
                console.log(res.data);// The request
                setDocs(res.data); // Save the data
                const timeout = setTimeout(() => {}, 500);
                return () => clearTimeout(timeout);
            } catch (err) {
                console.error("Failed to load docs");
            }
        };

        fetchDocs(); // Call it immediately
    }, [search,categoryFilter]); // 4. The Dependency Array [] (Empty means "Run only once on mount")
    // Helper: Turn any PDF link into a Viewable Image link
    const getPreviewUrl = (url) => {
        if (!url) return '';
        // If it's a PDF, change extension to .jpg to get a preview image
        if (url.endsWith('.pdf')) {
            return url.replace('.pdf', '.jpg');
        }
        return url;
    };
    const handleEditClick = (doc) => {
        setEditingDoc(doc);
        // Pre-fill the form with existing data
        setFormData({
            vendor: doc.extracted_vendor || '',
            amount: doc.extracted_amount || '',
            date: doc.extracted_date ? doc.extracted_date.split('T')[0] : '', // Fix date format
            category: doc.category || ''
        });
    };
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Send PUT request
            const res = await api.put(`/documents/${editingDoc.id}`, formData);
            
            // Update the local list instantly (so we don't need to refresh)
            setDocs(docs.map(d => d.id === editingDoc.id ? res.data : d));
            
            // Close modal
            setEditingDoc(null);
        } catch (err) {
            alert("Failed to save changes");
        }
    };
    const handleDownload = async (docId, filename) => {
        try {
            const token = localStorage.getItem('token');
            
            // 1. Fetch as a Blob (Binary Large Object)
            const response = await fetch(`http://localhost:5000/documents/${docId}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (!response.ok) throw new Error("Download failed");
    
            // 2. Create a hidden download link
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename; // Name the file
            document.body.appendChild(link);
            link.click();
            link.remove();
            
        } catch (err) {
            alert("Download Failed! " + err.message);
        }
    };

    const deleteDocument = async (docId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this document? This action cannot be undone.");
        if (!confirmDelete) return;
        try{
            const result = await api.delete(`/documents/${docId}`);
            // Remove the deleted document from the local state to update the UI
            setDocs(docs.filter(doc => doc.id !== docId));
            alert("Document deleted successfully.");
        }catch(err){
            alert("Failed to delete document. " + err.message);
        }
    }

    const handleUploadSuccess = (newDoc) => {
        console.log("New Doc received:", newDoc); // Add this debug line
    setDocs([newDoc, ...docs]); 
    setShowUpload(false);
    };

    const handleExport = async () => {
        try{
            const result = await api.get('/documents/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([result.data]));
            const link = document.createElement('a');
            link.href=url;
            link.setAttribute('download', `open_audit_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }catch(err){
            console.log("Export Failed:", err.message);
            alert("Failed to export documents. " + err.message);
        }
    }
   
    return (
        <div>
            <div className = "page-header">
                <h2>📂 My Documents</h2>
                <button 
                    onClick={() => setShowUpload(true)} 
                    style={{padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}
                >
                    + Upload New
                </button>
                <div onClick={handleExport} 
                >
                    <div style={{fontSize: '1.5 rem'}}>
                        📉
                        <strong>Export CSV</strong>
                    </div>
                </div>
                <a href ="/">Back to dashboard</a>
            </div>
            
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        
                    {/* Search Box */}
                    <div style={{ flex: 1 }}>
                        <input 
                            type="text" 
                            placeholder="🔍 Search Vendor (e.g. Starbucks)..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Category Dropdown */}
                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{ marginLeft:'10px',  padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', background: 'white', minWidth: '150px' }}
                    >
                        <option value="">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Travel">Travel</option>
                        <option value="Medical">Medical (80D)</option>
                        <option value="Investments">Investments (80C)</option>
                        <option value="Utilities">Utilities</option>
                    </select>

                    {/* Reset Button (Optional) */}
                    {(search || categoryFilter !== 'All') && (
                        <button 
                            onClick={() => { setSearch(""); setCategoryFilter(""); }}
                            style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#555' }}
                        >
                            ✖ Clear
                        </button>
                    )}
                </div>
                <table className="table-wrapper">
                    
                    {/* Table Header */}
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef', textAlign: 'left' }}>
                            <th style={{ padding: '15px', color: '#6c757d' }}>Date</th>
                            <th style={{ padding: '15px', color: '#6c757d' }}>Vendor</th>
                            <th style={{ padding: '15px', color: '#6c757d' }}>Category</th>
                            <th style={{ padding: '15px', color: '#6c757d', textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '15px', color: '#6c757d' }}>Audit Status</th>
                            <th style={{ padding: '15px', color: '#6c757d', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {docs?.map((doc, index) => (
                            <tr key={doc?.id} style={{ borderBottom: '1px solid #eee' }}>
                                
                                {/* 1. Date */}
                                <td style={{ padding: '15px' }}>
                                    {doc?.extracted_date ? doc?.extracted_date.split('T')[0] : <span style={{color:'#ccc'}}>-</span>}
                                </td>

                                {/* 2. Vendor (Bold) */}
                                <td style={{ padding: '15px', fontWeight: '500' }}>
                                    {doc?.extracted_vendor || <span style={{color:'red'}}>Unknown</span>}
                                </td>

                                {/* 3. Category (Badge style) */}
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        background: '#e3f2fd', color: '#1565c0', 
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' 
                                    }}>
                                        {doc?.category || 'Uncategorized'}
                                    </span>
                                </td>

                                {/* 4. Amount (Right Aligned + Currency) */}
                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ₹{parseFloat(doc?.extracted_amount || 0).toLocaleString('en-IN')}
                                </td>

                                {/* 5. Audit Flags (The Logic we just built) */}
                                <td style={{ padding: '15px' }}>
                                    {doc?.audit_flags && doc?.audit_flags.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {doc?.audit_flags.map((flag, i) => (
                                                <span key={i} style={{ 
                                                    color: '#d32f2f', background: '#ffebee', 
                                                    padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', width: 'fit-content'
                                                }}>
                                                    🚩 {flag}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#2e7d32', background: '#e8f5e9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            ✅ Clean
                                        </span>
                                    )}
                                </td>

                                {/* 6. Actions (Icons/Buttons) */}
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => window.open(doc.file_url.replace('.pdf', '.jpg'), '_blank')} 
                                        style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="View Receipt"
                                    >
                                        👁️
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleEditClick(doc)} 
                                        style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Edit Data"
                                    >
                                        ✏️
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleDownload(doc.id, `receipt_${doc.id}`)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Download File"
                                    >
                                        ⬇️
                                    </button>
                                    <button 
                                        onClick={() => deleteDocument(doc.id)} 
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                        title="Delete File"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State Message */}
                {docs?.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                        No receipts found. Upload one to get started! 🚀
                    </div>
                )}
            </div>
            {showUpload && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '400px', overflow: 'hidden' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', background: '#f9fafb' }}>
                            <h3 style={{margin:0}}>Upload</h3>
                            <button onClick={() => setShowUpload(false)} style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem'}}>×</button>
                        </div>
                        <div style={{padding: '20px'}}>
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                        </div>
                    </div>
                </div>
            )}
            {editingDoc && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '400px', overflow: 'hidden' }}>
                        
                        {/* Header */}
                        <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', background: '#f9fafb' }}>
                            <h3 style={{margin:0}}>✏️ Edit Document</h3>
                            <button onClick={() => setEditingDoc(null)} style={{border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem'}}>×</button>
                        </div>
                        
                        {/* The Form */}
                        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            
                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666'}}>Vendor Name</label>
                                <input 
                                    type="text" 
                                    value={formData.vendor} 
                                    onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666'}}>Date</label>
                                <input 
                                    type="date" 
                                    value={formData.date} 
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666'}}>Category</label>
                                <select 
                                    value={formData.category} 
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white' }}
                                >
                                    <option value="">Uncategorized</option>
                                    <option value="Food">Food</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Medical">Medical (80D)</option>
                                    <option value="Investments">Investments (80C)</option>
                                    <option value="Utilities">Utilities</option>
                                </select>
                            </div>

                            <div>
                                <label style={{display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#666'}}>Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={formData.amount} 
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                style={{ marginTop: '10px', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                💾 Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FiledDashboard;
