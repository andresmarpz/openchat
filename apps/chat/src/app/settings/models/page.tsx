'use client';

import { useState } from 'react';
import { Input } from '~/components/ui/input';

export default function ModelsPage() {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="m-auto max-w-2xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Model Settings</h2>
          <p className="text-muted-foreground mb-6">
            Configure your API keys and model preferences.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="openrouter-api-key" className="block text-sm font-medium mb-2">
              OpenRouter API Key
            </label>
            <Input
              id="openrouter-api-key"
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your API key will be stored securely and used to access OpenRouter models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}