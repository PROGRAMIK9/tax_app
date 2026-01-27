import { useState } from 'react';
import api from '../api/axios'; // The helper we made
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role:'', full_name: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Disable button while loading

    try {
      // 3. Send data to Backend (Port 5000)
      const res = await api.post('/auth/register', formData);

      // 4. Success!
      toast.success(res.data.message); // Show pop-up
      
      // 5. Store the Token safely in the browser
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 6. Redirect to Dashboard
      navigate('/dashboard'); 

    } catch (err) {
      // 7. Handle Error
      const errorMsg = err.response?.data?.error || "Register Failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false); // Re-enable button
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Tax Audit Registration</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              name="full_name" 
              value={formData.full_name} 
              onChange={handleChange} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label>Role</label>
            <input 
              type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="user or admin"
                style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

            <h3>Have an account? <a href="/register">Login Here</a></h3>
        </form>
      </div>
    </div>
  );
};

// Simple CSS-in-JS for quick styling (We can replace with CSS later)
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '350px' },
  inputGroup: { marginBottom: '1rem' },
  input: { width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' },
  button: { width: '100%', padding: '0.75rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }
};

export default Login;
