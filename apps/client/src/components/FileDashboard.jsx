import {useState, useEffect} from 'react';
import api from '../api/axios';
const FiledDashboard = () => {
    const [docs, setDocs] = useState(null);
    // Add these inside your Dashboard component (near the other useState)
    const [editingDoc, setEditingDoc] = useState(null); // The doc currently being edited
    const [formData, setFormData] = useState({}); // The form data
    useEffect(() => {
        // 3. The Async Function ⏳
        // We can't make the useEffect itself async, so we define a helper inside.
        const fetchDocs = async () => {
            try {
                const res = await api.get('/documents'); 
                console.log(res.data);// The request
                setDocs(res.data); // Save the data
            } catch (err) {
                console.error("Failed to load docs");
            }
        };

        fetchDocs(); // Call it immediately
    }, []); // 4. The Dependency Array [] (Empty means "Run only once on mount")
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
   
    return (
        <div>
            <h2>My Documents</h2>
            <a href ="/">Back to dashboard</a>
            {/* 5. The Map Loop 🗺️ */}
            {/* We take the 'docs' array and convert each item into a Table Row <tr> */}
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    
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
                        {docs.map((doc, index) => (
                            <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                                
                                {/* 1. Date */}
                                <td style={{ padding: '15px' }}>
                                    {doc.extracted_date ? doc.extracted_date.split('T')[0] : <span style={{color:'#ccc'}}>-</span>}
                                </td>

                                {/* 2. Vendor (Bold) */}
                                <td style={{ padding: '15px', fontWeight: '500' }}>
                                    {doc.extracted_vendor || <span style={{color:'red'}}>Unknown</span>}
                                </td>

                                {/* 3. Category (Badge style) */}
                                <td style={{ padding: '15px' }}>
                                    <span style={{ 
                                        background: '#e3f2fd', color: '#1565c0', 
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem' 
                                    }}>
                                        {doc.category || 'Uncategorized'}
                                    </span>
                                </td>

                                {/* 4. Amount (Right Aligned + Currency) */}
                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                    ₹{parseFloat(doc.extracted_amount || 0).toLocaleString('en-IN')}
                                </td>

                                {/* 5. Audit Flags (The Logic we just built) */}
                                <td style={{ padding: '15px' }}>
                                    {doc.audit_flags && doc.audit_flags.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            {doc.audit_flags.map((flag, i) => (
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
                {docs.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                        No receipts found. Upload one to get started! 🚀
                    </div>
                )}
            </div>
        </div>
    );
};
export default FiledDashboard;
