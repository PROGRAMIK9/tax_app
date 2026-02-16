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
   
    return (
        <div>
            <h2>My Documents</h2>
            {/* 5. The Map Loop 🗺️ */}
            {/* We take the 'docs' array and convert each item into a Table Row <tr> */}
            {docs?.map((doc) => (
                <div key={doc.id} className="doc-card">
                    <p>Vendor: {doc.extracted_vendor}</p>
                    <p>Amount: {doc.extracted_amount}</p>
                    {/* Cloudinary URL for the "View" button */}
                    <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Button 1: The Instant Preview (Safe) */}
                            <a 
                                href={getPreviewUrl(doc.file_url)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none' }}
                            >
                                👁️ View
                            </a>
                            {/* Add this button in your Action column */}
                            <button 
                                onClick={() => handleEditClick(doc)}
                                style={{ marginLeft: '10px', cursor: 'pointer' }}
                            >
                                ✏️ Edit
                            </button>

                            {/* Button 2: The Download (For the real file) */}
                            {/* Button 2: The Action */}
                            <button 
                                onClick={() => handleDownload(doc.id, doc.file_url.split('/').pop())} // Pass the filename from URL
                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', border: 'none', background: 'none' }}
                            >
                                ⬇️ Save
                            </button>
                        </div>
                    </td>
                    {/* --- EDIT MODAL --- */}
                    {editingDoc && (
                        <div style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                        }}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '300px' }}>
                                <h3>📝 Edit Receipt</h3>
                                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    
                                    <label>Vendor:</label>
                                    <input 
                                        value={formData.vendor} 
                                        onChange={(e) => setFormData({...formData, vendor: e.target.value})} 
                                    />

                                    <label>Amount:</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={formData.amount} 
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                                    />

                                    <label>Date:</label>
                                    <input 
                                        type="date"
                                        value={formData.date} 
                                        onChange={(e) => setFormData({...formData, date: e.target.value})} 
                                    />

                                    <label>Category:</label>
                                    <select 
                                        value={formData.category} 
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                       <option value="RENT_RECEIPT">Rent Receipt</option>
                                        <option value="MEDICAL_BILL">Medical Bill</option>
                                        <option value="DONATION_RECEIPT">Donation (80G)</option>
                                    </select>

                                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                        <button type="button" onClick={() => setEditingDoc(null)}>Cancel</button>
                                        <button type="submit" style={{ background: 'blue', color: 'white' }}>Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
export default FiledDashboard;
