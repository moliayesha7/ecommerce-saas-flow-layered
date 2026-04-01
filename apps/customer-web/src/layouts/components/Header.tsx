import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Menu, X, Store } from 'lucide-react';
import { useCartStore } from '../../stores/cart.store';
import { useAuthStore } from '../../stores/auth.store';
import { useWishlistStore } from '../../stores/wishlist.store';
import { cn } from '@saas-commerce/ui';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-secondary-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Store className="h-4 w-4 text-white" />
            </div>
            <span className="hidden text-lg font-bold text-secondary-900 sm:block">SaaS Commerce</span>
          </Link>

          {/* Nav Links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn('text-sm font-medium transition-colors', isActive
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-secondary-900')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex-1 max-w-sm">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  className="w-full rounded-lg border border-secondary-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X className="h-4 w-4 text-secondary-500" />
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-secondary-500 hover:text-secondary-700">
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 text-secondary-500 hover:text-secondary-700">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button onClick={openCart} className="relative p-2 text-secondary-500 hover:text-secondary-700">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Account */}
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/account" className="flex items-center gap-1.5 text-sm font-medium text-secondary-700 hover:text-secondary-900">
                <User className="h-4 w-4" />
                {user.firstName}
              </Link>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-secondary-600 hover:text-secondary-900">Login</Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen((o) => !o)} className="p-2 text-secondary-500 md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="border-t border-secondary-100 bg-white px-4 pb-4 md:hidden">
          <nav className="space-y-1 pt-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50"
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50">
                  My Account
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="block w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
