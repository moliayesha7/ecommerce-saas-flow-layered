import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@saas-commerce/ui';

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Platform Settings</h1>
        <p className="text-sm text-secondary-500">Configure global platform settings</p>
      </div>
      <Card>
        <CardHeader><CardTitle>General Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Platform Name" defaultValue="SaaS Commerce" />
          <Input label="Support Email" type="email" defaultValue="support@saas-commerce.com" />
          <Input label="Commission Rate (%)" type="number" defaultValue="5" />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
