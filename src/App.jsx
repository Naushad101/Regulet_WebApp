import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './pages/SignInPage';
import ProfilePage from './pages/ProfilePage';
import AgentSignInPage from './pages/AgentSignInPage';
import AgentProfilePage from './pages/AgentProfilePage';

function RootRedirect() {
  React.useEffect(() => {
    window.location.href = '/contactus.html';
  }, []);
  return null;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('isAuthenticated') === 'true'
  );
  const [userData, setUserData] = useState(() => {
    const stored = sessionStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(
    () => sessionStorage.getItem('isAgentAuthenticated') === 'true'
  );
  const [agentData, setAgentData] = useState(() => {
    const stored = sessionStorage.getItem('agentData');
    return stored ? JSON.parse(stored) : null;
  });

  const handleSignInSuccess = (data) => {
    setUserData(data);
    setIsAuthenticated(true);
    sessionStorage.setItem('userData', JSON.stringify(data));
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('isAuthenticated');
  };

  const handleAgentSignInSuccess = (data) => {
    setAgentData(data);
    setIsAgentAuthenticated(true);
    sessionStorage.setItem('agentData', JSON.stringify(data));
    sessionStorage.setItem('isAgentAuthenticated', 'true');
  };

  const handleAgentLogout = () => {
    setIsAgentAuthenticated(false);
    setAgentData(null);
    sessionStorage.removeItem('agentData');
    sessionStorage.removeItem('isAgentAuthenticated');
  };

  return (
    <Router>
      <Routes>
        {/* Root: always redirect to contactus.html */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── USER routes ── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/profile" replace />
              : <SignInPage onSignInSuccess={handleSignInSuccess} />
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated
              ? <ProfilePage userData={userData} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        />

        {/* ── AGENT routes ── */}
        <Route
          path="/agent/login"
          element={
            isAgentAuthenticated
              ? <Navigate to="/agent/profile" replace />
              : <AgentSignInPage onSignInSuccess={handleAgentSignInSuccess} />
          }
        />
        <Route
          path="/agent/profile"
          element={
            isAgentAuthenticated
              ? <AgentProfilePage agentData={agentData} onLogout={handleAgentLogout} />
              : <Navigate to="/agent/login" replace />
          }
        />

        {/* Fallback: anything unknown goes to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;