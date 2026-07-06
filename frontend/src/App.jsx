import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { useLocale } from './context/LocaleContext.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const Assistant = lazy(() => import('./pages/Assistant.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Emergency = lazy(() => import('./pages/Emergency.jsx'));
const FAQ = lazy(() => import('./pages/FAQ.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ServiceDetails = lazy(() => import('./pages/ServiceDetails.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));

export default function App() {
  const { locale } = useLocale();

  return (
    <div lang={locale} className="min-h-screen bg-slate-50 text-ink transition-colors dark:bg-slate-950 dark:text-slate-100">
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/emergency" element={<Emergency />} />
                <Route path="/services/:serviceId" element={<ServiceDetails />} />
                <Route path="/emergency" element={<Navigate to="/services/emergency" replace />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route
                  path="/dashboard"
                  element={(
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/admin"
                  element={(
                    <ProtectedRoute requireAdmin redirectTo="/login">
                      <AdminDashboard />
                    </ProtectedRoute>
                  )}
                />
                <Route
                  path="/profile"
                  element={(
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  )}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </div>
  );
}


