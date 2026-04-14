import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';
import { Agents } from './pages/Agents';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';

// Force key change on route change
function RoutesWithKey() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.key}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/kanban" element={<Kanban />} />
      <Route path="/agents" element={<Agents />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <RoutesWithKey />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
