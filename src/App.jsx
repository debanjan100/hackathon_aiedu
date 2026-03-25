import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
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
import ProblemDeck from './pages/ProblemDeck';
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
  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="page-transition-wrapper">
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
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
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
          <Route path="problems" element={<PageWrapper><ProblemDeck /></PageWrapper>} />
          <Route path="course/:topicId" element={<PageWrapper><Course /></PageWrapper>} />
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
