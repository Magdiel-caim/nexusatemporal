import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './i18n';
import './styles/index.css';

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('theme-storage');
if (savedTheme) {
  try {
    const { state } = JSON.parse(savedTheme);
    document.documentElement.classList.add(state.theme || 'light');
  } catch {
    document.documentElement.classList.add('light');
  }
} else {
  document.documentElement.classList.add('light');
}

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
