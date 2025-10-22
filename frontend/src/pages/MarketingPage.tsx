import React from 'react';

export default function MarketingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Marketing</h1>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">🚀 Módulo de Marketing</h2>
          <p className="text-gray-700 mb-4">
            O módulo de Marketing foi implementado no backend e está funcional via API.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>APIs Disponíveis:</strong>
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            <li>POST/GET/PUT/DELETE /api/marketing/campaigns</li>
            <li>POST/GET/PUT/DELETE /api/marketing/social-posts</li>
            <li>POST/GET /api/marketing/bulk-messages</li>
            <li>POST/GET/PUT /api/marketing/landing-pages</li>
            <li>POST /api/marketing/ai/analyze</li>
          </ul>
          <p className="text-sm text-gray-600">
            Interface em desenvolvimento. Use as APIs diretamente por enquanto.
          </p>
        </div>
      </div>
    </div>
  );
}
