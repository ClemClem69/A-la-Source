import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, Leaf, Mail, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Header() {
  const { profile, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/producteurs', label: 'Producteurs' },
    { to: '/qui-sommes-nous', label: 'Qui sommes-nous ?' },
  ];

  function handleSignOut() {
    signOut();
    setUserMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="french-flag flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 p-1 shadow-sm">
              <Leaf className="h-5 w-5 text-primary-900 drop-shadow-sm" />
            </div>
            <span className="font-serif text-lg font-bold text-primary-800 hidden sm:block">
              Mon marché futé
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-stone-600 hover:text-primary-700 hover:bg-stone-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            {profile?.role !== 'producer' && (
              <Link
                to="/panier"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label="Panier"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary-500 px-1 text-xs font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User menu */}
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-stone-100 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Mon compte"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name || 'Avatar'} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-stone-200 bg-white shadow-lg z-20 animate-fade-in">
                      <div className="px-4 py-3 border-b border-stone-100">
                        <p className="text-sm font-semibold text-stone-800">{profile.full_name || 'Mon compte'}</p>
                        <p className="text-xs text-stone-500">{profile.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <User className="h-4 w-4" /> Mon profil
                        </Link>
                        {profile.role !== 'producer' && (
                          <Link
                            to="/commandes"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                          >
                            <ShoppingCart className="h-4 w-4" /> Mes commandes
                          </Link>
                        )}
                        {profile.role === 'producer' && (
                          <Link
                            to="/producteur"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                          >
                            <LayoutDashboard className="h-4 w-4" /> Espace producteur
                          </Link>
                        )}
                        {profile.role === 'admin' && (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                            >
                              <LayoutDashboard className="h-4 w-4" /> Administration
                            </Link>
                            <Link
                              to="/admin/ajouter-producteur"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                            >
                              <User className="h-4 w-4" /> Ajouter un producteur
                            </Link>
                            <Link
                              to="/admin/messagerie"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                            >
                              <Mail className="h-4 w-4" /> Messagerie
                            </Link>
                            <Link
                              to="/admin/evenements"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                            >
                              <Activity className="h-4 w-4" /> Évènements
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/connexion" className="btn-secondary">
                  Connexion
                </Link>
                <Link to="/inscription" className="btn-primary">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-stone-200 py-3 animate-slide-up">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.to
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!profile && (
                <div className="flex gap-2 mt-2 px-3">
                  <Link to="/connexion" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1">
                    Connexion
                  </Link>
                  <Link to="/inscription" onClick={() => setMenuOpen(false)} className="btn-primary flex-1">
                    S'inscrire
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
