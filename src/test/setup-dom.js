import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Dodajemy matchery z jest-dom
expect.extend(matchers);

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
}); 