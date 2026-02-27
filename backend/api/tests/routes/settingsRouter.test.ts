import express from 'express';
import settingsRouter from '../../src/routes/settingsRouter';

const app = express();
app.use(express.json());
app.use('/api', settingsRouter);

describe('Settings Router', () => {
  it('should have settings router defined', () => {
    expect(settingsRouter).toBeDefined();
  });
});
