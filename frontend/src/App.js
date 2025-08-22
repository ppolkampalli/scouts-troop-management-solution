import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import TroopManagement from './components/TroopManagement';
import UserManagement from './components/UserManagement';
import CampoutPlanning from './components/CampoutPlanning';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/troop-management" element={<TroopManagement />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/campout-planning" element={<CampoutPlanning />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
