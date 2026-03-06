import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import OfflineBanner from './components/Network/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';

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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('userInfo');
  return user ? children : <Navigate to="/login" />;
};

// Layout wrapper — adds Sidebar + StatusBar on protected pages
const AppLayout = ({ children }) => {
  const location = useLocation();
  const publicPaths = ['/home', '/login', '/signup'];
  const isSnippet = location.pathname.startsWith('/snippet/');
  const isPublic = publicPaths.includes(location.pathname) || isSnippet;

  if (isPublic) return <>{children}</>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        {children}
      </main>
      <StatusBar />
      <MobileTabBar current={location.pathname} />
    </div>
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

const App = () => {
  return (
    <Router>
      <OfflineBanner />
      <ErrorBoundary>
        <AppLayout>
          <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '15px' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(167, 139, 250, 0.2)', borderTop: '4px solid #A78BFA', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <p style={{ color: '#888' }}>Loading Workspace...</p>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/snippet/:id" element={<SnippetViewer />} />
              <Route path="/classroom/join/:code" element={<ClassroomJoinHandler />} />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
              <Route path="/quiz-creator" element={<ProtectedRoute><QuizCreator /></ProtectedRoute>} />
              <Route path="/classroom" element={<ProtectedRoute><Classroom /></ProtectedRoute>} />
              <Route path="/room" element={<ProtectedRoute><Room /></ProtectedRoute>} />
              <Route path="/instructor" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
              <Route path="/code-review" element={<ProtectedRoute><CodeReview /></ProtectedRoute>} />
              <Route path="/test-lab" element={<ProtectedRoute><TestLab /></ProtectedRoute>} />
              <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
              <Route path="/campus" element={<ProtectedRoute><CampusDashboard /></ProtectedRoute>} />
              <Route path="/campus/:id" element={<ProtectedRoute><ClassroomDetails /></ProtectedRoute>} />
              <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
              <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
              <Route path="/video-lessons" element={<ProtectedRoute><VideoLessons /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><ProgressReports /></ProtectedRoute>} />
              <Route path="/problems" element={<ProtectedRoute><ProblemList /></ProtectedRoute>} />
              <Route path="/problems/:slug" element={<ProtectedRoute><ProblemSolve /></ProtectedRoute>} />
              <Route path="/git-learn" element={<ProtectedRoute><GitLearn /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </AppLayout>
      </ErrorBoundary>
    </Router>
  );
};

export default App;