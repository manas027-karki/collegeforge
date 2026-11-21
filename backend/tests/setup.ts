// Test setup - runs before all tests
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  // Set test env vars if needed
  process.env.NODE_ENV = 'test';
});

afterAll(async () => {
  // Cleanup
});
