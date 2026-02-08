import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login'; 
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileUpload from './components/FileUpload.jsx';

function App() {
  return (
    <Router>
      {/* Toaster allows pop-up messages to show anywhere */}
      <Toaster position="top-center" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<FileUpload />} />
      </Routes>
    </Router>
    
  );
}

export default App;