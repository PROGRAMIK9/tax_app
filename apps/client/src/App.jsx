import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login'; 
import Register from './pages/Register';

function App() {
  return (
    <Router>
      {/* Toaster allows pop-up messages to show anywhere */}
      <Toaster position="top-center" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>Home Page (Dashboard Coming Soon)</h1>} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;