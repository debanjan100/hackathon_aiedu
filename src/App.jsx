import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Spin } from 'antd';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import DashboardErrorBoundary from './components/DashboardErrorBoundary';

/* ── Lazy-loaded pages — each becomes its own JS chunk ── */
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const StudyPlanner = lazy(() => import('./pages/StudyPlanner'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Course = lazy(() => import('./pages/Course'));
const Certificate = lazy(() => import('./pages/Certificate'));
const PracticeRoom = lazy(() => import('./pages/PracticeRoom'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const Assessment = lazy(() => import('./pages/Assessment'));
const Resources = lazy(() => import('./pages/Resources'));
const LearningVideos = lazy(() => import('./pages/LearningVideos'));
const RaiseComplaint = lazy(() => import('./pages/RaiseComplaint'));
const ResumeScanner = lazy(() => import('./pages/ResumeScanner'));

/* ── Fallback spinner ── */
const PageSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};


const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial" animate="in" exit="out"
    variants={pageVariants}
    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    className="page-transition-wrapper"
  >
    <Suspense fallback={<PageSpinner />}>
      {children}
    </Suspense>
  </motion.div>
);

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
        {/* Public landing */}
        <Route path="/" element={
          <PageWrapper>
            {isLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />}
          </PageWrapper>
        } />

        {/* Auth — split-layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        </Route>

        {/* Protected — top-nav layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={
            <PageWrapper>
              <DashboardErrorBoundary>
                <Dashboard />
              </DashboardErrorBoundary>
            </PageWrapper>
          } />

          <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="assessment" element={<PageWrapper><Assessment /></PageWrapper>} />
          <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
          <Route path="planner" element={<PageWrapper><StudyPlanner /></PageWrapper>} />
          <Route path="roadmap" element={<PageWrapper><Roadmap /></PageWrapper>} />
          <Route path="course/:topicId" element={<PageWrapper><Course /></PageWrapper>} />
          <Route path="certificate" element={<PageWrapper><Certificate /></PageWrapper>} />
          <Route path="practice" element={<PageWrapper><PracticeRoom /></PageWrapper>} />
          <Route path="leaderboard" element={<PageWrapper><LeaderboardPage /></PageWrapper>} />
          <Route path="resources" element={<PageWrapper><Resources /></PageWrapper>} />
          <Route path="videos" element={<PageWrapper><LearningVideos /></PageWrapper>} />
          <Route path="raise-complaint" element={<PageWrapper><RaiseComplaint /></PageWrapper>} />
          <Route path="resume-scanner" element={<PageWrapper><ResumeScanner /></PageWrapper>} />
        </Route>

        {/* Convenience alias */}
        <Route path="/raise-complaint" element={<Navigate to="/dashboard/raise-complaint" replace />} />
        <Route path="/resume-scanner" element={<Navigate to="/dashboard/resume-scanner" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
