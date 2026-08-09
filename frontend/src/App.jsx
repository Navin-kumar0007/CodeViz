import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import Topnav from './components/Layout/Topnav';
import StatusBar from './components/Layout/StatusBar';
import OfflineBanner from './components/Network/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalCursorTrail from './components/Layout/GlobalCursorTrail';
import CursorFx from './components/Layout/CursorFx';
import AuroraBackground from './components/Layout/AuroraBackground';

// Eager Loading for generic pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SnippetViewer from './pages/SnippetViewer';
import ClassroomJoinHandler from './pages/ClassroomJoinHandler';

// Lazy-loaded Components (Code Splitting) to reduce initial bundle size
const Practice = lazy(() => import('./pages/Practice'));
const Learn = lazy(() => import('./pages/Learn'));
const QuizCreator = lazy(() => import('./pages/QuizCreator'));
const Classroom = lazy(() => import('./pages/Classroom'));
const Room = lazy(() => import('./pages/Room'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const ConceptMap = lazy(() => import('./pages/ConceptMap'));
const Sessions = lazy(() => import('./pages/Sessions'));
const CodeReview = lazy(() => import('./pages/CodeReview'));
const TestLab = lazy(() => import('./pages/TestLab'));
const Translator = lazy(() => import('./pages/Translator'));
const CampusDashboard = lazy(() => import('./pages/CampusDashboard'));
const ClassroomDetails = lazy(() => import('./pages/ClassroomDetails'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep'));
const Forum = lazy(() => import('./pages/Forum'));
const VideoLessons = lazy(() => import('./pages/VideoLessons'));
const ProgressReports = lazy(() => import('./pages/ProgressReports'));
const ProblemList = lazy(() => import('./pages/ProblemList'));
const ProblemSolve = lazy(() => import('./pages/ProblemSolve'));
const GitLearn = lazy(() => import('./pages/GitLearn'));
const AlgoRace = lazy(() => import('./pages/AlgoRace'));
const PeerReview = lazy(() => import('./pages/PeerReview'));
const InterviewDashboard = lazy(() => import('./pages/InterviewDashboard'));
const LiveInterview = lazy(() => import('./pages/LiveInterview'));
const CareerPathway = lazy(() => import('./pages/CareerPathway'));
const NeuralPathway = lazy(() => import('./pages/NeuralPathway'));
const Profile = lazy(() => import('./pages/Profile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const About = lazy(() => import('./pages/About'));
const UIKit = lazy(() => import('./pages/UIKit'));
const SharePage = lazy(() => import('./pages/SharePage'));
const EmbedPage = lazy(() => import('./pages/EmbedPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Mentor = lazy(() => import('./pages/Mentor'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const Certificates = lazy(() => import('./pages/Certificates'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const Contact = lazy(() => import('./pages/Contact'));
const Support = lazy(() => import('./pages/Support'));
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Terms })));

// Protected Route Component
const ROLE_RANK = { student: 1, instructor: 2, admin: 3 };

// Gate by login, and optionally by a minimum role (admin outranks instructor).
const ProtectedRoute = ({ children, minRole }) => {
  const raw = localStorage.getItem('userInfo');
  if (!raw) return <Navigate to="/login" />;
  if (minRole) {
    let role = 'student';
    try { role = JSON.parse(raw).role || 'student'; } catch { /* default student */ }
    if ((ROLE_RANK[role] || 0) < (ROLE_RANK[minRole] || 99)) return <Navigate to="/" replace />;
  }
  return children;
};

import GlobalBackground from './components/Layout/GlobalBackground';

// Layout wrapper — adds Sidebar + StatusBar on protected pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const publicPaths = ['/home', '/login', '/signup', '/about', '/contact', '/support', '/privacy', '/terms'];
  const isSnippet = location.pathname.startsWith('/snippet/');
  const isShare = location.pathname.startsWith('/share/') || location.pathname.startsWith('/embed/');
  const isPublicProfile = location.pathname.startsWith('/u/');
  const isVerify = location.pathname.startsWith('/verify/');
  const isPublic = publicPaths.includes(location.pathname) || isSnippet || isShare || isPublicProfile || isVerify;

  if (isPublic) return <>{children}</>;

  return (
    <>
      <GlobalBackground />
      <div className="app-layout" style={{ background: 'transparent' }}>
        <Sidebar />
        <main className="app-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Topnav />
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </div>
        </main>
        <StatusBar />
        <MobileTabBar current={location.pathname} />
      </div>
    </>
  );
};

// Bottom tab bar for mobile devices
const MobileTabBar = ({ current }) => {
  const navigate = useNavigate();
  const tabs = [
    { path: '/', icon: '⌂', label: 'Home' },
    { path: '/practice', icon: '⟩_', label: 'Practice' },
    { path: '/interview-prep', icon: '🎯', label: 'Interview' },
    { path: '/forum', icon: '💬', label: 'Forum' },
    { path: '/progress', icon: '📊', label: 'Reports' }
  ];
  return (
    <nav className="mobile-tab-bar">
      {tabs.map(t => (
        <button key={t.path} onClick={() => navigate(t.path)}
          className={current === t.path ? 'active' : ''}>
          {t.icon}<span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
};

// Separate AnimatedRoutes component to use useLocation hook inside Router
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/snippet/:id" element={<SnippetViewer />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/ui-kit" element={<UIKit />} />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/embed/:token" element={<EmbedPage />} />
        <Route path="/u/:handle" element={<PublicProfile />} />
        <Route path="/verify/:credentialId" element={<VerifyCertificate />} />
        <Route path="/classroom/join/:code" element={<ClassroomJoinHandler />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
        <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
        <Route path="/quiz-creator" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
        <Route path="/classroom" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
        <Route path="/room" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/instructor" element={<ProtectedRoute minRole="instructor"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute minRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute minRole="admin"><AdminContent /></ProtectedRoute>} />
        <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/concept-map" element={<ProtectedRoute><ConceptMap /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
        <Route path="/code-review" element={<ProtectedRoute><CodeReview /></ProtectedRoute>} />
        <Route path="/peer-review" element={<ProtectedRoute><PeerReview /></ProtectedRoute>} />
        <Route path="/test-lab" element={<ProtectedRoute><TestLab /></ProtectedRoute>} />
        <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
        <Route path="/campus" element={<ProtectedRoute minRole="instructor"><CampusDashboard /></ProtectedRoute>} />
        <Route path="/campus/:id" element={<ProtectedRoute minRole="instructor"><ClassroomDetails /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/interview-dashboard" element={<ProtectedRoute><InterviewDashboard /></ProtectedRoute>} />
        <Route path="/live-interview/:sessionId" element={<ProtectedRoute><LiveInterview /></ProtectedRoute>} />
        <Route path="/career-pathway" element={<ProtectedRoute><CareerPathway /></ProtectedRoute>} />
        <Route path="/neural-pathway" element={<ProtectedRoute><NeuralPathway /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/video-lessons" element={<ProtectedRoute><VideoLessons /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><ProgressReports /></ProtectedRoute>} />
        <Route path="/problems" element={<ProtectedRoute><ProblemList /></ProtectedRoute>} />
        <Route path="/problems/:slug" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />
        <Route path="/git-learn" element={<ProtectedRoute><GitLearn /></ProtectedRoute>} />
        <Route path="/algo-race" element={<ProtectedRoute><AlgoRace /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
        <Route path="/mentor" element={<ProtectedRoute><Mentor /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <AuroraBackground />
      <GlobalCursorTrail />
      <CursorFx />
      <OfflineBanner />
      <ErrorBoundary>
        <AppLayout>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '15px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(167, 139, 250, 0.2)', borderTop: '4px solid #A78BFA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-muted)' }}>Loading Workspace...</p>
            </div>
          }>
            <AnimatedRoutes />
          </Suspense>
        </AppLayout>
      </ErrorBoundary>
    </Router>
  );
};

export default App;