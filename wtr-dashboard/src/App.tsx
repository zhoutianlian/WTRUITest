import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import OnChainPage from './pages/OnChainPage'; // Will act as layout/outlet
import MacroIndicatorsPage from './pages/onchain/MacroIndicatorsPage';
import ExchangeFlowsPage from './pages/onchain/ExchangeFlowsPage';
import WhaleTrackingPage from './pages/onchain/WhaleTrackingPage';
import DerivativesPage from './pages/DerivativesPage'; // Will act as layout/outlet
import FuturesAnalysisPage from './pages/derivatives/FuturesAnalysisPage';
import OptionsAnalysisPage from './pages/derivatives/OptionsAnalysisPage';
import SignalsPage from './pages/SignalsPage';
import ResearchPage from './pages/ResearchPage';
import ResearchDetailPage from './pages/ResearchDetailPage'; // Import ResearchDetailPage
import AboutPage from './pages/AboutPage';
import EntryPage from './pages/EntryPage'; // Import EntryPage
import { Navigate } from 'react-router-dom'; // Import Navigate

// Placeholder for a potential NotFoundPage
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} /> {/* New default route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}> {/* MainLayout now for specific child routes */}
        <Route path="dashboard" element={<DashboardPage />} /> {/* Dashboard now at /dashboard */}
        <Route path="on-chain" element={<OnChainPage />}>
          <Route index element={<Navigate to="macro-indicators" replace />} />
          <Route path="macro-indicators" element={<MacroIndicatorsPage />} />
          <Route path="exchange-flows" element={<ExchangeFlowsPage />} />
          <Route path="whale-tracking" element={<WhaleTrackingPage />} />
        </Route>
        {/* ... other routes under MainLayout ... */}
        <Route path="derivatives" element={<DerivativesPage />}>
          <Route index element={<Navigate to="futures-analysis" replace />} />
          <Route path="futures-analysis" element={<FuturesAnalysisPage />} />
          <Route path="options-analysis" element={<OptionsAnalysisPage />} />
        </Route>
        <Route path="signals" element={<SignalsPage />} />
        <Route path="research">
          <Route index element={<ResearchPage />} />
          <Route path=":articleId" element={<ResearchDetailPage />} />
        </Route>
        <Route path="about" element={<AboutPage />} />
      </Route>
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
