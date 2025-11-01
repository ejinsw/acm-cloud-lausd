import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import authenticationRouter from './routes/authenticationRouter';
import userRouter from './routes/userRouter';
import sessionRouter from './routes/sessionRouter';
import reviewRouter from './routes/reviewRouter';
import subjectRouter from './routes/subjectRouter';
import adminRouter from './routes/adminRouter';
import queueRouter from './routes/queueRouter';
import sseRouter from './routes/sseRouter';
import zoomRouter from './routes/zoomRouter';
import { prisma } from './config/prisma';
import sessionHistoryRouter from './routes/sessionHistoryRouter';

dotenv.config();

const app: Application = express();

/**
 * Middleware
 */
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware to handle API Gateway stage prefixes
app.use((req: Request, res: Response, next: NextFunction) => {
  // Check if the URL starts with a stage prefix (e.g., /dev/, /prod/, etc.)
  const stageMatch = req.url.match(/^\/([^/]+)\/(.*)/);
  if (stageMatch) {
    const stage = stageMatch[1];
    const path = stageMatch[2];

    // Only strip if it looks like a stage name (not a real path)
    if (['dev', 'prod', 'staging', 'test'].includes(stage)) {
      req.url = '/' + path;
      console.log(`Stripped stage prefix: /${stage}/${path} -> /${path}`);
    }
  }
  next();
});

/**
 * Routes
 */
app.use('/api', authenticationRouter);
app.use('/api', userRouter);
app.use('/api', sessionRouter);
app.use('/api', reviewRouter);
app.use('/api', subjectRouter);
app.use('/api', adminRouter);
app.use('/api', sessionHistoryRouter);
app.use('/api', queueRouter);
app.use('/api', sseRouter);
app.use('/api', zoomRouter);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  console.log('Connecting to database...');
  try {
    await prisma.$connect();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
    });
  }
  console.log('Database connected successfully');

  await prisma.$disconnect();

  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

/**
 * FOR SERVER
 */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
