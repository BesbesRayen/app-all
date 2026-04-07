'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, CreditCard, LogOut, User } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/boutiques', label: 'Boutiques' },
  { href: '/support', label: 'Support' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [jwtUser, setJwtUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
  const { data: session } = useSession();

  // Check localStorage for JWT user on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setJwtUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine logged-in user from either source
  const isLoggedIn = !!jwtUser || !!session?.user;
  const displayName = jwtUser
    ? `${jwtUser.firstName} ${jwtUser.lastName}`.trim()
    : session?.user?.name || '';

  const handleLogout = async () => {
    // Clear JWT auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setJwtUser(null);
    // Clear NextAuth session (if any) and redirect to home
    if (session) {
      signOut({ callbackUrl: '/' });
    } else {
      window.location.href = '/';
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom mx-auto">
        <nav className="flex items-center justify-between h-16 md:h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900">
              Credit<span className="text-primary-600">TN</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-xl border border-primary-100">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{displayName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link href="/register" className="btn-primary text-sm !px-5 !py-2.5">
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{displayName}</span>
                    </div>
                    <button
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center btn-secondary text-sm"
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center btn-primary text-sm"
                    >
                      Créer un compte
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
