import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';

// Ribinės klasės (Boundary) — vartotojo sąsajos langai
import Prisijungti from './pages/Login';                               // paketas: Naudotojas
import PagrindinisLangas from './pages/Dashboard';                     // paketas: Main
import AutomatuSarasoLangas from './pages/MachinesView';                   // paketas: Administracijos
import PildytiPrekes from './pages/Inventory';                         // paketas: Aptarnavimo
import NaudotojuSarasas from './pages/Users';                          // paketas: Administracijos
import AtvaizduotiDienotvarke from './pages/ServicePlanning';          // paketas: Dienotvarkės
import AtaskaitosLangas from './pages/Reports';                        // paketas: Main
import ŽemėlapioLangas from './pages/MapView';                         // paketas: Main
import Profilis from './pages/Profilis';                                // paketas: Naudotojas

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'administrator') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Prisijungti />} />
        <Route path="/" element={<PrivateRoute><Layout><PagrindinisLangas /></Layout></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><Layout><PildytiPrekes /></Layout></PrivateRoute>} />
        <Route path="/service" element={<PrivateRoute><Layout><AtvaizduotiDienotvarke /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><AtaskaitosLangas /></Layout></PrivateRoute>} />
        <Route path="/map" element={<PrivateRoute><Layout><ŽemėlapioLangas /></Layout></PrivateRoute>} />
        <Route path="/profilis" element={<PrivateRoute><Layout><Profilis /></Layout></PrivateRoute>} />
        <Route path="/machines" element={<AdminRoute><Layout><AutomatuSarasoLangas /></Layout></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Layout><NaudotojuSarasas /></Layout></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
