import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PyodideProvider } from './context/PyodideContext';

// Layout
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineIndicator } from './components/layout/OfflineIndicator';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { GamePage } from './pages/GamePage';
import { ProfilePage } from './pages/ProfilePage';
import { GamificationPage } from './pages/GamificationPage';

import './App.css';

/**
 * Componente principal da aplicação PyExplorer
 * Um jogo educativo para ensinar Python para crianças
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <PyodideProvider>
          <div className="app">
            <Header />
            <main className="app__main">
              <Routes>
                {/* Páginas públicas */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Páginas protegidas (requerem login ou modo convidado) */}
                <Route
                  path="/game"
                  element={
                    <ProtectedRoute>
                      <GamePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <ProtectedRoute>
                      <GamificationPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <OfflineIndicator />
          </div>
        </PyodideProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
