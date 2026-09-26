import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ViewModule } from './pages/ViewModule';
import { UpdateModule } from './pages/UpdateModule';
import { NewCaseModule } from './pages/NewCaseModule';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { authService } from './services/authService';

export const App = () => {
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (userProfile) => {
    setUser(userProfile);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main className="main-content">
          <Routes>
            <Route
              path="/login"
              element={
                authService.isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view"
              element={
                <ProtectedRoute>
                  <ViewModule user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/update"
              element={
                <ProtectedRoute>
                  <UpdateModule user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/new-case"
              element={
                <ProtectedRoute>
                  <NewCaseModule user={user} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute>
                  <AuditLogsPage user={user} />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
