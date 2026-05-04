import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MascotProvider, useMascotContext } from './context/MascotContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { GamificationToastContainer } from './components/gamification';

// Layout (carregado imediatamente - pequenos)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineIndicator } from './components/layout/OfflineIndicator';

// Mascot - lazy loaded para reduzir bundle inicial
const Mascot = lazy(() => import('./components/mascot').then(m => ({ default: m.Mascot })));

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
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const GamificationPage = lazy(() => import('./pages/GamificationPage').then(m => ({ default: m.GamificationPage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then(m => ({ default: m.LearnPage })));
const ArticlePage = lazy(() => import('./pages/ArticlePage').then(m => ({ default: m.ArticlePage })));
const CertificatePage = lazy(() => import('./pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));

// GamePage com Pyodide - lazy loaded separadamente para reduzir bundle inicial
const GamePageWithPyodide = lazy(() =>
  import('./pages/GamePage').then(async (m) => {
    // Pyodide só é importado quando GamePage é acessado
    const { PyodideProvider } = await import('./context/PyodideContext');
    return {
      default: () => (
        <PyodideProvider>
          <m.GamePage />
        </PyodideProvider>
      )
    };
  })
);

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
    <Suspense fallback={null}>
      <Mascot
        mood={mood}
        message={message}
        visible={visible}
        size="medium"
        position="bottom-right"
      />
    </Suspense>
  );
}

/**
 * Componente que exibe notificações globais de gamificação
 */
function GlobalToasts() {
  const { newAchievements, showLevelUp, markAchievementSeen, dismissLevelUp } = useGamification();

  return (
    <GamificationToastContainer
      achievements={newAchievements}
      levelUp={showLevelUp}
      onDismissAchievement={markAchievementSeen}
      onDismissLevelUp={dismissLevelUp}
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
      <HelmetProvider>
        <AuthProvider>
          <GamificationProvider>
            <MascotProvider>
              <div className="app">
                <a href="#main-content" className="skip-to-content">
                  Pular para o conteúdo principal
                </a>
                <Header />
                <main id="main-content" className="app__main" tabIndex={-1}>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Páginas públicas */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/learn" element={<LearnPage />} />
                      <Route path="/learn/:slug" element={<ArticlePage />} />
                      <Route
                        path="/python-para-criancas"
                        element={
                          <HomePage
                            seoTitle="Python para Crianças: Aprenda Programação Jogando"
                            seoDescription="Descubra como ensinar Python para crianças de forma divertida e gratuita com o PyExplorer. O melhor jogo de programação infantil!"
                          />
                        }
                      />
                      <Route
                        path="/aprender-python-jogando"
                        element={
                          <HomePage
                            seoTitle="Aprender Python Jogando: Aventura Educativa Grátis"
                            seoDescription="Quer aprender Python do zero de um jeito divertido? No PyExplorer você aprende lógica e programação resolvendo desafios em um jogo incrível!"
                          />
                        }
                      />
                      <Route path="/certificate" element={<CertificatePage />} />
                      <Route path="/about" element={<AboutPage />} />

                      {/* Páginas protegidas (requerem login ou modo convidado) */}
                      <Route
                        path="/game"
                        element={
                          <ProtectedRoute>
                            <GamePageWithPyodide />
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
                {/* Notificações globais */}
                <GlobalToasts />
              </div>
            </MascotProvider>
          </GamificationProvider>
        </AuthProvider>
      </HelmetProvider>
    </Router>
  );
}

export { App };
export default App;

