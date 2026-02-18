import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login'; 
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileUpload from './components/FileUpload';
import FileDashboard from './components/FileDashboard';
import Calculator from './components/Calculator';
import History from './components/History';
import StatsCard from './components/StatsCard';
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
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/history" element={<History />} />
        <Route path="/files" element={<FileDashboard />} />
        <Route path="/stats" element={<StatsCard />} />
      </Routes>
    </Router>
    
  );
}

export default App;