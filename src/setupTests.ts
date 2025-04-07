import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Make vi available globally
declare global {
  // Use var instead of interface augmentation to avoid self-reference
  var vitest: typeof vi;
  var jest: any;
}

// Assign to global objects
global.vitest = vi;
global.jest = vi;

// Mock matchMedia
window.matchMedia = window.matchMedia || (() => {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  };
});

// Setup TextEncoder/TextDecoder
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Add ResizeObserver mock
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock; 