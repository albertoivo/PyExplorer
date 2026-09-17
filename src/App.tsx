import { BrowserRouter as Router, Routes, Route, useParams, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Suspense, lazy, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { MascotProvider, useMascotContext } from './context/MascotContext';
import { GamificationProvider, useGamification } from './context/GamificationContext';
import { GamificationToastContainer } from './components/gamification';
import { supportedLanguages, DEFAULT_LANGUAGE } from './i18n';

// Layout (carregado imediatamente - pequenos)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { ScrollToTop } from './components/layout/ScrollToTop';

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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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

import { useTranslation } from 'react-i18next';

/**
 * Componente de loading durante lazy load
 */
function PageLoader() {
  const { t } = useTranslation('common');
  return (
    <div className="page-loader">
      <div className="page-loader__spinner"></div>
      <p className="page-loader__text">{t('loading')}</p>
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
 * Sincroniza o idioma da aplicação com o parâmetro :lang na URL.
 * Exibe página 404 para prefixos de idioma inválidos (ex: /fr/about).
 */
function LanguageRouteWrapper() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const isSupported = Boolean(lang && (supportedLanguages as readonly string[]).includes(lang));

  useEffect(() => {
    if (isSupported && lang && i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang, isSupported, i18n]);

  if (!isSupported) {
    return <NotFoundPage />;
  }

  return <Outlet />;
}

/**
 * Garante que rotas na raiz (sem prefixo) utilizem o idioma padrão (pt).
 */
function RootRouteWrapper() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== DEFAULT_LANGUAGE) {
      void i18n.changeLanguage(DEFAULT_LANGUAGE);
    }
  }, [i18n]);

  return <Outlet />;
}

/**
 * Componente principal da aplicação PyExplorer
 * Um jogo educativo para ensinar Python para crianças
 */
// fallow-ignore-next-line unused-export
export function App() {
  return (
    <Router>
      <ScrollToTop />
      <HelmetProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </HelmetProvider>
    </Router>
  );
}

function AppContent() {
  const { userData, isGuest } = useAuth();
  const hasPlayerContext = Boolean(userData) || isGuest;
  const { t } = useTranslation('common');

  const renderRoutes = () => (
    <>
      {/* Páginas públicas */}
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="learn" element={<LearnPage />} />
      <Route path="learn/:slug" element={<ArticlePage />} />
      <Route
        path="python-para-criancas"
        element={
          <HomePage
            seoTitleKey="seoPythonKids.title"
            seoDescriptionKey="seoPythonKids.description"
          />
        }
      />
      <Route
        path="aprender-python-jogando"
        element={
          <HomePage
            seoTitleKey="seoLearnPlaying.title"
            seoDescriptionKey="seoLearnPlaying.description"
          />
        }
      />
      <Route path="certificate" element={<CertificatePage />} />
      <Route path="about" element={<AboutPage />} />

      {/* Páginas protegidas (requerem login ou modo convidado) */}
      <Route
        path="game"
        element={
          <ProtectedRoute>
            <GamePageWithPyodide />
          </ProtectedRoute>
        }
      />
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="rewards"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
    </>
  );

  const appLayout = (
    <div className="app">
      <a href="#main-content" className="skip-to-content">
        {t('aria.skipToContent')}
      </a>
      <Header />
      <main id="main-content" className="app__main" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rotas padrão (Português) */}
            <Route path="/" element={<RootRouteWrapper />}>
              {renderRoutes()}
            </Route>

            {/* Rotas com prefixo de idioma (/pt, /en, /es, /hi) */}
            <Route path="/:lang" element={<LanguageRouteWrapper />}>
              {renderRoutes()}
            </Route>

            {/* Catch-all route para página 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <OfflineIndicator />
    </div>
  );

  return (
    <GamificationProvider>
      {hasPlayerContext ? (
        <MascotProvider>
          {appLayout}
          {/* Mascote global */}
          <GlobalMascot />
          {/* Notificações globais */}
          <GlobalToasts />
        </MascotProvider>
      ) : (
        appLayout
      )}
    </GamificationProvider>
  );
}

export default App;

