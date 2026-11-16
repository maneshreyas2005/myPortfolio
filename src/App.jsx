import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import Preloader from './components/Preloader';

const Home = lazy(() => import('./pages/Home'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));
const Admin = lazy(() => import('./pages/Admin'));

const RouteFallback = () => (
  <div className="min-h-screen bg-bg-dark text-white flex items-center justify-center">
    <div className="animate-pulse text-white/50">Loading…</div>
  </div>
);

function App() {
  return (
    <PortfolioProvider>
      <Preloader>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </Preloader>
    </PortfolioProvider>
  );
}

export default App;
