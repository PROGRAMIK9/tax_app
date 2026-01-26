import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login'; 

function App() {
  return (
    <Router>
      {/* Toaster allows pop-up messages to show anywhere */}
      <Toaster position="top-center" />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>Home Page (Dashboard Coming Soon)</h1>} />
      </Routes>
    </Router>
  );
}

export default App;