import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Background3D from './components/Background3D';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import Analytics from './pages/Analytics';
import Course from './pages/Course';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import StudyPlanner from './pages/StudyPlanner';
import Roadmap from './pages/Roadmap';
import MockInterview from './pages/MockInterview';
import Certificate from './pages/Certificate';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 1.02, y: -10 }
};

const PageWrapper = ({ children }) => (
  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="page-transition-wrapper">
    {children}
  </motion.div>
);

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
        <Route path="/" element={<PageWrapper>{isLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />}</PageWrapper>} />

        <Route element={<PageWrapper><AuthLayout /></PageWrapper>}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="profile" element={<PageWrapper><Profile /></PageWrapper>} />
          <Route path="assessment" element={<PageWrapper><Assessment /></PageWrapper>} />
          <Route path="analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
          <Route path="planner" element={<PageWrapper><StudyPlanner /></PageWrapper>} />
          <Route path="roadmap" element={<PageWrapper><Roadmap /></PageWrapper>} />
          <Route path="course/:topicId" element={<PageWrapper><Course /></PageWrapper>} />
          <Route path="certificate" element={<PageWrapper><Certificate /></PageWrapper>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
