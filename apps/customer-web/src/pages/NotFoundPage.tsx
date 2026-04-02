import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@saas-commerce/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-secondary-200">404</h1>
      <p className="text-xl text-secondary-600">Page not found</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  );
}
