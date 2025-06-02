import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import OnChainPage from './pages/OnChainPage';
import DerivativesPage from './pages/DerivativesPage';
import SignalsPage from './pages/SignalsPage';
import ResearchPage from './pages/ResearchPage';
import AboutPage from './pages/AboutPage';

// Placeholder for a potential NotFoundPage
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} /> {/* Default for / */}
        <Route path="on-chain" element={<OnChainPage />} />
        <Route path="derivatives" element={<DerivativesPage />} />
        <Route path="signals" element={<SignalsPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="about" element={<AboutPage />} />
        {/* Example for a 404 page - create NotFoundPage.tsx if needed */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;
