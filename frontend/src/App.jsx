import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice'; // Your Visualizer
import Learn from './pages/Learn'; // Structured Learning
import QuizCreator from './pages/QuizCreator'; // Custom Quiz Creator
import Classroom from './pages/Classroom'; // Classroom Mode
import InstructorDashboard from './pages/InstructorDashboard'; // Instructor Analytics
import AdminPanel from './pages/AdminPanel'; // Admin Management
import SnippetViewer from './pages/SnippetViewer'; // Public Code Viewer

// Protected Route Component (Blocks access if not logged in)
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('userInfo');
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Must be Logged In) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-creator"
          element={
            <ProtectedRoute>
              <QuizCreator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <Classroom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor"
          element={
            <ProtectedRoute>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/snippet/:id"
          element={<SnippetViewer />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;