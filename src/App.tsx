import { useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Producers from './pages/Producers';
import ProducerDetail from './pages/ProducerDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import StaticPage from './pages/StaticPage';
import Contact from './pages/Contact';

// Consumer pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

// Producer pages
import ProducerDashboard from './pages/producer/ProducerDashboard';
import ProducerProducts from './pages/producer/ProducerProducts';
import ProducerOrders from './pages/producer/ProducerOrders';
import ProducerSignup from './pages/producer/ProducerSignup';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducers from './pages/admin/AdminProducers';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminPricing from './pages/admin/AdminPricing';
import AdminMessages from './pages/admin/AdminMessages';
import AdminEvents from './pages/admin/AdminEvents';
import AdminProducerAccount from './pages/admin/AdminProducerAccount';
import { useAuth } from './contexts/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NonProducerRoute({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (profile?.role === 'producer') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/catalogue" element={<Catalog />} />
                <Route path="/produit/:id" element={<ProductDetail />} />
                <Route path="/producteurs" element={<Producers />} />
                <Route path="/producteur/:id" element={<ProducerDetail />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/inscription" element={<Register />} />
                <Route path="/mot-de-passe-oublie" element={<ResetPassword />} />

                {/* Static pages */}
                <Route path="/qui-sommes-nous" element={<StaticPage page="about" />} />
                <Route path="/comment-ca-marche" element={<StaticPage page="how-it-works" />} />
                <Route path="/engagements" element={<StaticPage page="engagements" />} />
                <Route path="/faq" element={<StaticPage page="faq" />} />
                <Route path="/cgv" element={<StaticPage page="cgv" />} />
                <Route path="/mentions-legales" element={<StaticPage page="legal" />} />
                <Route path="/confidentialite" element={<StaticPage page="privacy" />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/devenir-producteur" element={<StaticPage page="producer" />} />

                {/* Consumer routes */}
                <Route path="/panier" element={
                  <NonProducerRoute><Cart /></NonProducerRoute>
                } />
                <Route path="/commander" element={
                  <ProtectedRoute><NonProducerRoute><Checkout /></NonProducerRoute></ProtectedRoute>
                } />
                <Route path="/commandes" element={
                  <ProtectedRoute><Orders /></ProtectedRoute>
                } />
                <Route path="/profil" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Producer routes */}
                <Route path="/producteur" element={
                  <ProtectedRoute roles={['producer']}><ProducerDashboard /></ProtectedRoute>
                } />
                <Route path="/producteur/inscription" element={
                  <ProtectedRoute roles={['producer']}><ProducerSignup /></ProtectedRoute>
                } />
                <Route path="/producteur/produits" element={
                  <ProtectedRoute roles={['producer']}><ProducerProducts /></ProtectedRoute>
                } />
                <Route path="/producteur/commandes" element={
                  <ProtectedRoute roles={['producer']}><ProducerOrders /></ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/admin/producteurs" element={
                  <ProtectedRoute roles={['admin']}><AdminProducers /></ProtectedRoute>
                } />
                <Route path="/admin/utilisateurs" element={
                  <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
                } />
                <Route path="/admin/produits" element={
                  <ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>
                } />
                <Route path="/admin/tarifs" element={
                  <ProtectedRoute roles={['admin']}><AdminPricing /></ProtectedRoute>
                } />
                <Route path="/admin/messagerie" element={
                  <ProtectedRoute roles={['admin']}><AdminMessages /></ProtectedRoute>
                } />
                <Route path="/admin/evenements" element={
                  <ProtectedRoute roles={['admin']}><AdminEvents /></ProtectedRoute>
                } />
                <Route path="/admin/ajouter-producteur" element={
                  <ProtectedRoute roles={['admin']}><AdminProducerAccount /></ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
