import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import OnChainPage from './pages/OnChainPage';
import DerivativesPage from './pages/DerivativesPage';
import SignalsPage from './pages/SignalsPage';
import ResearchPage from './pages/ResearchPage';
import AboutPage from './pages/AboutPage';
import EntryPage from './pages/EntryPage'; // Import EntryPage

// Placeholder for a potential NotFoundPage
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} /> {/* New default route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}> {/* MainLayout now for specific child routes */}
        <Route path="dashboard" element={<DashboardPage />} /> {/* Dashboard now at /dashboard */}
        <Route path="on-chain" element={<OnChainPage />} />
        {/* ... other routes under MainLayout ... */}
        <Route path="derivatives" element={<DerivativesPage />} />
        <Route path="signals" element={<SignalsPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
