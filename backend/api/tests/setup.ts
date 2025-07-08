import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';

(global as any).console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

jest.setTimeout(10000); 