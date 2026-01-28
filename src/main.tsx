import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';
import { AuthProvider } from './contexts/AuthContext';
import App from './App.tsx';
import './index.css';

// PostHog 配置
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_q9ZcLd7BFuHd58czP2daIfpY9y9sl3Z5MsjlNFYhH5W';
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

const posthogOptions = {
  api_host: POSTHOG_HOST,
  person_profiles: 'identified_only' as const,
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
};

// 条件渲染：只有当 PostHog Key 存在时才启用 PostHog
const AppWithProviders = () => {
  // 如果 PostHog Key 存在，使用 PostHogProvider 包裹
  if (POSTHOG_KEY) {
    return (
      <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PostHogProvider>
    );
  }

  // 如果没有 PostHog Key，直接渲染 App
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>
);
