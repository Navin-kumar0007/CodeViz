import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Learn from './pages/Learn';
import QuizCreator from './pages/QuizCreator';
import Classroom from './pages/Classroom';
import Room from './pages/Room';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminPanel from './pages/AdminPanel';
import SnippetViewer from './pages/SnippetViewer';
import DailyChallenge from './pages/DailyChallenge';
import Roadmap from './pages/Roadmap';
import Sessions from './pages/Sessions';
import CodeReview from './pages/CodeReview';
import TestLab from './pages/TestLab';
import Translator from './pages/Translator';
import CampusDashboard from './pages/CampusDashboard';
import ClassroomDetails from './pages/ClassroomDetails';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import OfflineBanner from './components/Network/OfflineBanner';
import ClassroomJoinHandler from './pages/ClassroomJoinHandler';

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
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <OfflineBanner />
      <AppLayout>
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
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;