import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { connectDatabase } from './config/database';

export function createApp() {
  const app = express();

  // Connect to MongoDB
  connectDatabase().catch(console.error);

  app.use(
    cors({
      origin: ['https://admin.gocourierservice.com', 'https://gocourierservice.com'],
      credentials: true
    })
  );
  app.use(cookieParser());
  app.use(
    express.json({
      verify: (req, _res, buffer) => {
        (req as express.Request).rawBody = buffer.toString('utf8');
      }
    })
  );
  app.use('/api/v1', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
