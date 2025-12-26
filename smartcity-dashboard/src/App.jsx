// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import ClaimDetail from './components/claims/ClaimDetails';
import Employees from './pages/Employees';
import Teams from './pages/Teams';
import Statistics from './pages/Statistics';
import Resolution from './pages/Resolution';

import EntryPage from './pages/EntryPage';

import TeamResolvePage from "./pages/TeamResolvePage.jsx";
import SupervisorClosePage from "./pages/SupervisorClosePage.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/entry" element={<EntryPage />} />

        {/* Dashboard Superviseur */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/claims/:id" element={<ClaimDetail />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/statistics" element={<Statistics />} />
        
        {/* Formulaire Résolution Mobile (Chef équipe) */}
        <Route path="/resolution/:token" element={<Resolution />} />


{/* Formulaire Résolution supervisor plus leader final (Chef équipe) */}
        <Route path="/team/resolve" element={<TeamResolvePage />} />
        <Route path="/supervisor/close" element={<SupervisorClosePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;