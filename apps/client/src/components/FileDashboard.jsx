import {useState, useEffect} from 'react';
import api from '../api/axios';
const FiledDashboard = () => {
    const [docs, setDocs] = useState(null);
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
    async function deleteDoc(docId) {
    }
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
                </div>
            ))}
        </div>
    );
};
export default FiledDashboard;
