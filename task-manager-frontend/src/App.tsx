import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Kanban } from './pages/Kanban';

// Force key change on route change
function RoutesWithKey() {
  const location = useLocation();
  
  return (
    <Routes location={location} key={location.key}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/kanban" element={<Kanban />} />
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
