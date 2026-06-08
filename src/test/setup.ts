import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Resetira localStorage i DOM nakon svakog testa
afterEach(() => {
  cleanup();
  localStorage.clear();
});
