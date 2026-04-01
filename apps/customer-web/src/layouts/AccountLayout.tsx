import React, { Suspense } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

const NAV = [
  { to: '/account', label: 'Profile', icon: User },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-4">
            <nav className="space-y-1 rounded-xl bg-white p-4 shadow-sm h-fit">
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="lg:col-span-3">
              <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white" />}>
                <Outlet />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
