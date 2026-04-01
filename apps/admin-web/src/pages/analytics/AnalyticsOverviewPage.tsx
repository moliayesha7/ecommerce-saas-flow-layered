import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@saas-commerce/ui';

export default function AnalyticsOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
        <p className="text-sm text-secondary-500">Platform-wide analytics and insights</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg bg-secondary-50 text-secondary-400">
            Revenue chart — connect to dashboard API
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
