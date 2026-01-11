import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PyodideProvider } from './context/PyodideContext';
import { MascotProvider, useMascotContext } from './context/MascotContext';

// Layout (carregado imediatamente - pequenos)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineIndicator } from './components/layout/OfflineIndicator';

// Mascot (pequeno, carregado imediatamente)
import { Mascot } from './components/mascot';

// ===========================================
// EAGER LOADING (Home Page - LCP Optimization)
// ===========================================
import { HomePage } from './pages/HomePage';

// ===========================================
// LAZY LOADING DE PÁGINAS (Code Splitting)
// Cada página será um chunk separado
// ===========================================
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const GamePage = lazy(() => import('./pages/GamePage').then(m => ({ default: m.GamePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const GamificationPage = lazy(() => import('./pages/GamificationPage').then(m => ({ default: m.GamificationPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then(m => ({ default: m.LearnPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));

import './App.css';

/**
 * Componente de loading durante lazy load
 */
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader__spinner"></div>
      <p className="page-loader__text">Carregando...</p>
    </div>
  );
}

/**
 * Componente que exibe o mascote com estado global
 */
function GlobalMascot() {
  const { mood, message, visible } = useMascotContext();

  return (
    <Mascot
      mood={mood}
      message={message}
      visible={visible}
      size="medium"
      position="bottom-right"
    />
  );
}

/**
 * Componente principal da aplicação PyExplorer
 * Um jogo educativo para ensinar Python para crianças
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <PyodideProvider>
          <MascotProvider>
            <div className="app">
              <Header />
              <main className="app__main">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Páginas públicas */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/learn/:slug" element={<ArticlePage />} />
                    <Route path="/about" element={<AboutPage />} />

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
                </Suspense>
              </main>
              <Footer />
              <OfflineIndicator />

              {/* Mascote global */}
              <GlobalMascot />
            </div>
          </MascotProvider>
        </PyodideProvider>
      </AuthProvider>
    </Router>
  );
}

export { App };
export default App;
