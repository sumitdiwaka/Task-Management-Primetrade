import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
// At the top
import Dashboard from './pages/Dashboard';



function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

       {/* // Inside your Routes: */}
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />

      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;