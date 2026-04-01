import React from 'react';
import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-secondary-200 bg-secondary-900 text-secondary-300">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <Store className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SaaS Commerce</span>
            </div>
            <p className="text-sm text-secondary-400">
              Your one-stop marketplace for quality products from verified merchants.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-secondary-700 pt-6 text-center text-xs text-secondary-500">
          © {new Date().getFullYear()} SaaS Commerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
