import {useState} from 'react';
import api from '../api/axios';

const FileUpload = ({onUploadSuccess}) =>{
    const [file, setFile] = useState(null);
    const [type, setType] = useState('RENT_RECEIPT');
    const [message, setMessage] = useState('');

    const handleFileChange =(e)=>{
        setFile(e.target.files[0]);
    }

    const handleUpload = async (e) =>{
        e.preventDefault();
        if (!file) return alert("Please select a file!");

        // 1. Create FormData (Crucial for files)
        const formData = new FormData();
        formData.append('file', file);       // Must match backend 'file'
        formData.append('document_type', type);
        try{
            setMessage('Uploading to cloud...');
            // 2. Upload to Cloudinary via backend
            const response = await api.post("/documents/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('File uploaded successfully!');
            if (onUploadSuccess) {
                onUploadSuccess(response.data.doc); // Send the new document object back
            }
            console.log(response.data);
        }catch(err){
            setMessage('Upload failed. Please try again.');
            console.error(err);
        }
    }
    return (
        <div style={{ padding: '20px', border: '2px dashed #ccc', maxWidth: '400px' }}>
            <h3>📂 Upload Evidence</h3>
            <form onSubmit={handleUpload}>
                {/* Type Selector */}
                <select value={type} onChange={(e) => setType(e.target.value)} style={{ display: 'block', marginBottom: '10px' }}>
                    <option value="RENT_RECEIPT">Rent Receipt</option>
                    <option value="MEDICAL_BILL">Medical Bill</option>
                    <option value="DONATION_RECEIPT">Donation (80G)</option>
                </select>

                {/* File Input */}
                <input type="file" onChange={handleFileChange} style={{ display: 'block', marginBottom: '10px' }} />

                {/* Submit */}
                <button type="submit">Upload to Vault 🚀</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default FileUpload;