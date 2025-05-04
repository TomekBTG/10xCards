import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';

// Globalna konfiguracja dla testów

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Mockowanie fetch w testach
const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn();
});

afterAll(() => {
  global.fetch = originalFetch;
});

// Helper do tworzenia serwera MSW do mockowania zapytań HTTP
export function createMockServer(...handlers: any[]) {
  const server = setupServer(...handlers);
  
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  return server;
}

// Dodatkowe pomocnicze funkcje do testów
export * from '@testing-library/react';
export * from '@testing-library/user-event';

// Exportujemy vi aby było dostępne w testach bez importowania
export { vi }; 