import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';

import authenticationRouter from './routes/authenticationRouter';
import userRouter from './routes/userRouter';
import sessionRouter from './routes/sessionRouter';
import reviewRouter from './routes/reviewRouter';
import subjectRouter from './routes/subjectRouter';

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

/**
 * Routes
 */
app.use('/api', authenticationRouter);
app.use('/api', userRouter);
app.use('/api', sessionRouter);
app.use('/api', reviewRouter);
app.use('/api', subjectRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
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
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// FOR SERVERLESS
export const handler = serverless(app);
